package main

import "strings"

func classifyContestType(contestName string) string {
	var res string = "Other"

	if strings.Contains(contestName, "Mathforces") {
		res = "exclude"
	} else if strings.Contains(contestName, "Bubble Cup") {
		res = "Other"
	} else if strings.Contains(contestName, "Div. 1 + Div. 2") {
		res = "Div1 + Div2"
	} else if strings.Contains(contestName, "Educational") {
		res = "Educational"
	} else if strings.Contains(contestName, "Codeforces Global Round") {
		res = "Global"
	} else if strings.Contains(contestName, "Div. 1") {
		res = "Div1"
	} else if strings.Contains(contestName, "Div. 2") {
		res = "Div2"
	} else if strings.Contains(contestName, "Div. 3") {
		res = "Div3"
	} else if strings.Contains(contestName, "Div. 4") {
		res = "Div4"
	} else if strings.Contains(contestName, "Kotlin Heroes") {
		res = "Kotlin"
	} else if strings.Contains(contestName, "Q#") {
		res = "Q#"
	} else if strings.Contains(contestName, "ICPC") {
		res = "ICPC"
	}

	return res
}
