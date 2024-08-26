import time

import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
# from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import (ChromeType,
                                               OperationSystemManager)

from get_data import get_contests, get_problems
from update_data import update_contest
from utils import classify_contest_type


def get_driver():
    options = uc.ChromeOptions()
    options.headless = True
    options.add_argument(
        "--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 10_2 like Mac OS X) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.0 Mobile/14C92 Safari/602.1"
    )

    chrome_version = OperationSystemManager().get_browser_version_from_os(
        ChromeType.GOOGLE
    )
    version_main = int(chrome_version.split(".")[0])

    # initialize the undetected Chrome driver with specified options
    driver = uc.Chrome(use_subprocess=True, options=options, version_main=version_main)
    driver.implicitly_wait(10)

    return driver


def main():
    driver = get_driver()

    contests = get_contests()
    problem_list = get_problems()

    for contest in contests:
        now_unix_time = time.time()
        passed_time_seconds = now_unix_time - contest["startTimeSeconds"]

        # look only within 8 weeks
        if passed_time_seconds > 60 * 60 * 24 * 7 * 8:
            continue

        if contest["phase"] != "FINISHED":
            continue

        contest_type = classify_contest_type(contest["name"])
        update_contest(
            contest["id"], contest_type, contest["name"], problem_list, driver
        )

    driver.quit()


main()
