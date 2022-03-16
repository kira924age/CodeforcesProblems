# Contribution Guide

## How to make Pull Requset

If it is a little modification such as fix typo, please edit it directly on GitHub and send a Pull Request.

* [Editing files in your repository - User Documentation](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files)

Otherwise, please try the following steps.

1. Fork this repository by clicking on the Fork button.

* Ref: [Fork a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)

This will create a new copy of our repository under your GitHub user account with a URL like:

```
https://github.com/YOUR-USERNAME/CodeforcesProblems
```

2. Clone your fork repository.

* Ref: [cloning-a-repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)

Open your terminal on your local computer, and clone your fork repository by following command.

```
$ git clone git@github.com:YOUR-USERNAME/CodeforcesProblems.git
// or
$ git clone https://github.com/YOUR-USERNAME/CodeforcesPropblems
```

2. Make new branch on your fork repository

```
$ cd CodeforcesProblems
$ git checkout -b your-branch-name
```

3. Commit your modification

```
$ git commit -am 'your commit message'
```

4. Push

```
$ git push origin your-branch-name
```

5. Make a Pull Request

Access your fork repository URL (https://github.com/YOUR_USERNAME/CodeforcesProblems/pulls) and make Pull Request to main barnch.

* [Create PullRequest](../images/pull_request.png)
* [Comparing changes](../images/comparing_change.png)

