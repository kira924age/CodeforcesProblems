import json

from file_io import read_contest_json
from get_data import get_problem_names_and_indexes, get_problem_rating


def update_contest(contest_id, contest_type, contest_name, problem_list,
                   driver):
    contest_url = "https://codeforces.com/contest/" + str(contest_id)

    names, indexes = get_problem_names_and_indexes(contest_url, driver)

    problems = [[] for _ in range(len(indexes))]
    for key, (index, name) in enumerate(zip(indexes, names)):
        problem_url = contest_url + "/problem/" + index
        rating = get_problem_rating(contest_id, index, name, problem_url,
                                    problem_list, driver)

        if not rating:
            problems[key] = {"index": index, "name": name}
        else:
            problems[key] = {"index": index, "name": name, "rating": rating}

    contest_json = read_contest_json()
    idx = -1
    for key, contest in enumerate(contest_json):
        if contest["id"] == contest_id:
            idx = key

    add = {
        "id": contest_id,
        "type": contest_type,
        "name": contest_name,
        "problems": problems
    }

    if idx != -1:
        prev_contest = contest_json[idx]
        if not prev_contest["problems"]:
            contest_json[idx] = add
        elif len(add["problems"]) > len(prev_contest["problems"]):
            contest_json[idx] = add
        elif len(add["problems"]) == len(prev_contest["problems"]):
            for i, (prev_problem, add_problem) in enumerate(
                    zip(prev_contest["problems"], add["problems"])):

                if (prev_problem is not None) and "rating" in prev_problem:
                    continue

                contest_json[idx]["problems"][i] = add_problem
    else:
        contest_json = [add] + contest_json

    with open('contests.json', "w") as file:
        file.write(json.dumps(contest_json, indent=1))
