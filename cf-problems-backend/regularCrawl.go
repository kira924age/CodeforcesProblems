package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gocolly/colly"
)

func regularCrawl() {
	c := colly.NewCollector()
	c.OnResponse(func(r *colly.Response) {
		var response ContestList

		if err := json.Unmarshal(r.Body, &response); err != nil {
			log.Fatal(err)
		}

		if response.Status != "OK" {
			fmt.Println("Status Error")
			return
		}

		contests := response.Result
		// reverse Array
		for i, j := 0, len(contests)-1; i < j; i, j = i+1, j-1 {
			contests[i], contests[j] = contests[j], contests[i]
		}

		for _, contest := range contests {
			var contestPhase = contest.Phase
			var contestID = contest.ID
			var contestName = contest.Name

			if contestPhase != "FINISHED" {
				continue
			}

			nowSeconds := time.Now().Unix()
			passedTimeSeconds := nowSeconds - contest.StartTimeSeconds

			// see only within 4 weeks
			if passedTimeSeconds > 60*60*24*7*4 {
				continue
			}

			contestType := classifyContestType(contestName)

			// wait 5 second
			time.Sleep(5000 * time.Millisecond)
			updateContest(contestID, contestType, contestName)
		}
	})

	c.Visit("https://codeforces.com/api/contest.list")
}
