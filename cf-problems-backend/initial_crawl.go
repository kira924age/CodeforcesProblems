package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gocolly/colly"
)

type Contest struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Type   string `json:"type"`
	Phase  string `json:"phase"`
	Frozen bool   `json:"frozen"`
}

type ContestList struct {
	Status string    `json:"status"`
	Result []Contest `json:"result"`
}

type FormatedContest struct {
	ID       int       `json:"id"`
	Type     string    `json:"type"`
	Name     string    `json:"name"`
	Problems []Problem `json:"problems"`
}

func initialCrawl() {
	// Instantiate default collector
	c := colly.NewCollector()

	problems := getProblems()

	c.OnResponse(func(r *colly.Response) {
		// open contest.json
		file, err := os.Create("contests.json")
		if err != nil {
			log.Fatal(err)
		}
		defer file.Close()

		// JSON decode
		var response ContestList
		if err := json.Unmarshal(r.Body, &response); err != nil {
			log.Fatal(err)
		}

		if response.Status != "OK" {
			fmt.Println("Status Error")
			return
		}

		contests := make([]FormatedContest, 0)
		for _, contest := range response.Result {
			var contestPhase = contest.Phase
			var contestID = contest.ID

			if contestPhase != "FINISHED" {
				continue
			}

			contestType := classifyContestType(contest.Name)

			// wait 5 seconds
			time.Sleep(5000 * time.Millisecond)
			problems[contestID] = crawlContest(contestID, problems[contestID])

			contests = append(contests, FormatedContest{contestID, contestType, contest.Name, problems[contest.ID]})
		}

		// json, err := json.MarshalIndent(contests, "", "    ")
		json, err := json.Marshal(contests)
		if err != nil {
			log.Fatal(err)
		}

		file.Write(json)

		fmt.Println("Visited", r.Request.URL)
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	c.Visit("https://codeforces.com/api/contest.list")
}
