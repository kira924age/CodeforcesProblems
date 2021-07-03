package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"

	"github.com/gocolly/colly"
)

func updateContest(contestID int, contestType string, contestName string) {
	contestURL := "https://codeforces.com/contest/" + fmt.Sprint(contestID)

	jsonFile, err := os.Open("./contests.json")

	if err != nil {
		log.Fatal(err)
	}

	defer jsonFile.Close()

	// read our opened jsonFile as a byte array.
	byteValue, _ := ioutil.ReadAll(jsonFile)

	// we initialize our Users array
	contests := make([]FormatedContest, 0)

	// we unmarshal our byteArray which contains our
	json.Unmarshal(byteValue, &contests)

	idx := -1
	for i := 0; i < len(contests); i++ {
		if contests[i].ID == contestID {
			idx = i
			break
		}
	}

	var ps []Problem

	// Instantiate default collector
	c := colly.NewCollector()

	// On every a element which has href attribute call callback
	c.OnHTML("td.id > a[href]", func(e *colly.HTMLElement) {
		link := e.Attr("href")

		problemIndex := strings.TrimSpace(e.Text)
		problemName := getTitle(e.Request.AbsoluteURL(link))
		problemDiff := getDifficulty(e.Request.AbsoluteURL(link))

		if problemName != "" {
			if problemDiff != -1 {
				ps = append(ps, Problem{Index: problemIndex, Name: problemName, Rating: problemDiff})
			} else {
				ps = append(ps, Problem{Index: problemIndex, Name: problemName})
			}
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

	c.Visit(contestURL)

	add := FormatedContest{ID: contestID, Type: contestType, Name: contestName, Problems: ps}
	if idx != -1 {
		prev := contests[idx]
		if len(add.Problems) <= len(prev.Problems) {
			cnt := 0
			for i := 0; i < len(prev.Problems); i++ {
				if prev.Problems[i].Rating != 0 {
					cnt++
				}
			}
			if cnt != len(prev.Problems) {
				contests[idx] = add
			}
		} else {
			contests[idx] = add
		}
	} else {
		contests = append([]FormatedContest{add}, contests...)
	}

	json, err := json.MarshalIndent(contests, "", " ")
	// json, err := json.Marshal(contests)
	if err != nil {
		log.Fatal(err)
	}

	file, err := os.Create("contests.json")
	if err != nil {
		log.Fatal(err)
	}

	file.Write(json)
}
