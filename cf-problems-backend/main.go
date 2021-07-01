package main

import "os"

func main() {
	_, err := os.Stat("contests.json")
	isExist := !os.IsNotExist(err)

	if !isExist {
		initialCrawl()
	}
}
