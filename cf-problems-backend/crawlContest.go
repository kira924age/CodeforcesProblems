package main

import (
	"fmt"
	"strings"

	"github.com/gocolly/colly"
)

func getTitle(URL string) string {
	res := "HOGE"
	// Instantiate default collector
	c := colly.NewCollector()
	c.OnHTML(".problem-statement > .header > .title", func(e *colly.HTMLElement) {
		res = e.Text
	})

	// Start scraping on https://hackerspaces.org
	c.Visit(URL)

	fmt.Println("Problem Name : ", res)
	return res
}

func crawlContest(contestID int, problems []Problem) []Problem {
	res := problems
	contestURL := "https://codeforces.com/contest/" + fmt.Sprint(contestID)

	// Instantiate default collector
	c := colly.NewCollector()

	// On every a element which has href attribute call callback
	c.OnHTML("td.id > a[href]", func(e *colly.HTMLElement) {
		link := e.Attr("href")

		problemIndex := strings.TrimSpace(e.Text)
		problemName := getTitle(e.Request.AbsoluteURL(link))

		isExist := false
		for _, problem := range problems {
			if problem.Index == problemIndex {
				isExist = true
				break
			}
		}

		if !isExist {
			res = append(res, Problem{problemIndex, problemName, 0})
		}

		fmt.Printf("Link found: %q -> %s\n", problemIndex, link)
		// Visit link found on page
		// Only those links are visited which are in AllowedDomains
		c.Visit(e.Request.AbsoluteURL(link))
	})

	// Before making a request print "Visiting ..."
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL.String())
	})

	// Start scraping on https://hackerspaces.org
	c.Visit(contestURL)

	return res
}
