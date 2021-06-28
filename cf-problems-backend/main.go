package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

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

func main() {
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
			if contest.Phase != "FINISHED" {
				continue
			}

			contestType := "Other"

			if strings.Contains(contest.Name, "Educational") {
				contestType = "Educational"
			} else if strings.Contains(contest.Name, "Codeforces Global Round") {
				contestType = "Global"
			} else if strings.Contains(contest.Name, "Div. 1 + Div. 2") {
				contestType = "Div1 + Div2"
			} else if strings.Contains(contest.Name, "Div. 1") {
				contestType = "Div1"
			} else if strings.Contains(contest.Name, "Div. 2") {
				contestType = "Div2"
			} else if strings.Contains(contest.Name, "Div. 3") {
				contestType = "Div3"
			} else if strings.Contains(contest.Name, "Div. 4") {
				contestType = "Div4"
			} else if strings.Contains(contest.Name, "Kotlin Heroes") {
				contestType = "Kotlin"
			} else if strings.Contains(contest.Name, "Q#") {
				contestType = "Q#"
			} else if strings.Contains(contest.Name, "ICPC") {
				contestType = "ICPC"
			}

			contests = append(contests, FormatedContest{contest.ID, contestType, contest.Name, problems[contest.ID]})
		}

		json, err := json.MarshalIndent(contests, "", "    ")
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
