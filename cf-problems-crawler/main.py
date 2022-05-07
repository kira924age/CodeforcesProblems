import time

from selenium import webdriver

from get_data import get_contests, get_problems
from update_data import update_contest
from utils import classify_contest_type


def get_driver():
    options = webdriver.ChromeOptions()

    options.add_argument(
        '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 10_2 like Mac OS X) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.0 Mobile/14C92 Safari/602.1'
    )

    options.add_argument('--headless')
    options.add_argument("start-maximized")
    options.add_argument("enable-automation")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-browser-side-navigation")
    options.add_argument('--no-proxy-server')

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)

    return driver


def main():
    driver = get_driver()
    # driver = webdriver.Chrome()

    contests = get_contests()
    problem_list = get_problems()

    for contest in contests:
        now_unix_time = time.time()
        passed_time_seconds = now_unix_time - contest["startTimeSeconds"]

        # look only within 4 weeks
        if passed_time_seconds > 60 * 60 * 24 * 7 * 4:
            continue

        if contest["phase"] != "FINISHED":
            continue

        contest_type = classify_contest_type(contest["name"])
        update_contest(contest["id"], contest_type, contest["name"],
                       problem_list, driver)

    driver.quit()


main()
