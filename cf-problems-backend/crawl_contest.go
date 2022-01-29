package main

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gocolly/colly"
)

func getTitle(URL string) string {
	res := ""
	// Instantiate default collector
	c := colly.NewCollector()
	c.OnHTML(".problem-statement > .header > .title", func(e *colly.HTMLElement) {
		num := strings.Index(e.Text, ".")
		res = strings.TrimSpace(e.Text[num+1:])
	})

	c.Visit(URL)

	return res
}

func getDifficulty(URL string) int {
	res := -1
	// Instantiate default collector
	c := colly.NewCollector()
	c.OnHTML("span[title='Difficulty']", func(e *colly.HTMLElement) {
		diff, _ := strconv.Atoi(strings.TrimSpace(e.Text)[1:])
		res = diff
	})

	c.Visit(URL)

	fmt.Println("Difficulty:", res)
	return res
}

func crawlContest(contestId int, problems []Problem) []Problem {
	res := problems
	contestURL := "https://codeforces.com/contest/" + fmt.Sprint(contestId)

	// Instantiate default collector
	c := colly.NewCollector()

	// On every a element which has href attribute call callback
	c.OnHTML("td.id > a[href]", func(e *colly.HTMLElement) {
		link := e.Attr("href")

		problemIndex := strings.TrimSpace(e.Text)
		problemName := getTitle(e.Request.AbsoluteURL(link))
		problemDiff := getDifficulty(e.Request.AbsoluteURL(link))

		isExist := false
		for _, problem := range problems {
			if problem.Index == problemIndex {
				isExist = true
				break
			}
		}

		if !isExist && problemName != "" {
			if problemDiff != -1 {
				res = append(res, Problem{Index: problemIndex, Name: problemName, Rating: problemDiff})
			} else {
				res = append(res, Problem{Index: problemIndex, Name: problemName})
			}
		}

		fmt.Printf("Link found: %q -> %s\n", problemIndex, link)
		// Visit link found on page
		// Only those links are visited which are in AllowedDomains
		c.Visit(e.Request.AbsoluteURL(link))
	})

	// Before making a request print "Visiting ..."
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting ...", r.URL.String())
	})

	// Start scraping on https://codeforces.com/contest/{contestId}
	c.Visit(contestURL)

	return res
}
