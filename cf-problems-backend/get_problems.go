package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gocolly/colly"
)

type Problem struct {
	Index  string `json:"index"`
	Name   string `json:"name"`
	Rating int    `json:"rating,omitempty"`
}

type ProblemWithId struct {
	ContestId int    `json:"contestId"`
	Index     string `json:"index"`
	Name      string `json:"name"`
	Rating    int    `json:"rating,omitempty"`
}

type ProblemSet struct {
	Status string `json:"status"`
	Result struct {
		Problems          []ProblemWithId `json:"problems"`
		ProblemStatistics []struct {
			ContestId   int    `json:"contestId"`
			Index       string `json:"index"`
			SolvedCount int    `json:"solvedCount"`
		} `json:"problemStatistics"`
	} `json:"result"`
}

func getProblems() map[int][]Problem {
	res := make(map[int][]Problem, 0)

	c := colly.NewCollector()

	c.OnResponse(func(r *colly.Response) {
		var response ProblemSet
		if err := json.Unmarshal(r.Body, &response); err != nil {
			log.Fatal(err)
		}

		if response.Status != "OK" {
			fmt.Println("Status Error")
			return
		}

		for i := len(response.Result.Problems) - 1; i >= 0; i-- {
			problem := response.Result.Problems[i]
			res[problem.ContestId] = append(res[problem.ContestId], Problem{problem.Index, problem.Name, problem.Rating})
		}

		fmt.Println("Visited", r.Request.URL)
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	c.Visit("https://codeforces.com/api/problemset.problems")

	return res
}
