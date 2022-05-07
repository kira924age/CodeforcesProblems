#!/usr/bin/env python3

import time

import requests
from selenium import webdriver
from selenium.webdriver.common.by import By

# unit: sec
WAIT_TIME = 1


def get_problem_names_and_indexes(contest_url, driver):
    time.sleep(WAIT_TIME)
    driver.get(contest_url)

    name_web_elements = driver.find_elements(
        By.CSS_SELECTOR,
        "table > tbody > tr:not(:first-child) > td:nth-child(2) a")

    names = [name_web_element.text for name_web_element in name_web_elements]

    index_web_elements = driver.find_elements(By.CSS_SELECTOR,
                                              "table > tbody td.id > a")
    indexes = [
        index_web_element.text for index_web_element in index_web_elements
    ]

    print("indexes:", indexes)
    print("names:", names)
    return names, indexes


def get_problem_rating(contest_id, index, name, problem_url, problem_list,
                       driver):
    problem = [
        x for x in problem_list
        if x["contestId"] == contest_id and x["index"] == index
    ]

    if len(problem) != 0 and "rating" in problem[0]:
        return problem[0]["rating"]

    res = None
    time.sleep(WAIT_TIME)
    driver.get(problem_url)

    try:
        web_element = driver.find_element(By.CSS_SELECTOR,
                                          "span[title='Difficulty']")
        res = web_element.text[1:]
    except:
        pass

    print(contest_id, index, "diff:", res)

    return res


def get_contests():
    time.sleep(WAIT_TIME)
    response = requests.get("https://codeforces.com/api/contest.list")

    assert response.status_code == 200

    json = response.json()

    assert json["status"] == "OK"

    return json["result"][::-1]


def get_problems():
    time.sleep(WAIT_TIME)
    response = requests.get("https://codeforces.com/api/problemset.problems")
    assert response.status_code == 200

    json = response.json()

    assert json["status"] == "OK"

    return json["result"]["problems"]
