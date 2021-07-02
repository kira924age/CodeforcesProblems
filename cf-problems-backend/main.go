package main

import "os"

func main() {
	_, err := os.Stat("contests.json")
	isExist := !os.IsNotExist(err)

	if !isExist {
		initialCrawl()
	}

	updateContest(1350, "Div2", "Codeforces Round #641 (Div. 2)")
}
