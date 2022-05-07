def classify_contest_type(contest_name):
    res = "Other"

    if "Mathforces" in contest_name:
        res = "exclude"
    elif "Bubble Cup" in contest_name:
        res = "Other"
    elif "Div. 1 + Div. 2" in contest_name:
        res = "Div1 + Div2"
    elif "Educational" in contest_name:
        res = "Educational"
    elif "Codeforces Global Round" in contest_name:
        res = "Global"
    elif "Div. 1" in contest_name:
        res = "Div1"
    elif "Div. 2" in contest_name:
        res = "Div2"
    elif "Div. 3" in contest_name:
        res = "Div3"
    elif "Div. 4" in contest_name:
        res = "Div4"
    elif "Kotlin Heroes" in contest_name:
        res = "Kotlin"
    elif "Q#" in contest_name:
        res = "Q#"
    elif "ICPC" in contest_name:
        res = "ICPC"

    return res
