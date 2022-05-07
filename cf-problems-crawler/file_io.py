import json


def read_contest_json():
    with open("./contests.json", "r") as file:
        return json.load(file)
