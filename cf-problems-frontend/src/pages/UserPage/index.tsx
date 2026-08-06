import React from "react";
import Header from "../..//components/Header/Header";
import UserNotFound from "./UserNotFound";
import ErrorMessage from "../TablePage/ErrorMessage";
import Loading from "./Loading";
import UserNameLabel from "./UserNameLabel";
import Achievement from "./Achievement";
import SubmissionListTable from "./SubmissionListTable";
import Climbing from "./Climbing";
import Heatmap from "./Heatmap";
import { useParams } from "react-router-dom";
import { makeSolvedHistory } from "./makeSolvedHistory";
import { makeSubmissionHistory } from "./makeSubmissionHistory";
import { fetchUserSubmission, makeAchievementData } from "./userUtils";
import { cachedUserInfo } from "../../utils/TypedCachedApiClient";

const User: React.FunctionComponent = () => {
  const [isError, setIsError] = React.useState(false);
  const [isUserExist, setIsUserExist] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userRating, setUserRating] = React.useState(0);
  const [userSubmission, setUserSubmission] = React.useState([] as any[]);
  const [userInfo, setUserInfo] = React.useState({
    solvedCountAll: 0,
    solvedCountLastYear: 0,
    solvedCountLastMonth: 0,
    longestStreak: 0,
    currentStreak: 0,
    streakSum: 0,
    solvedHistory: [] as any[],
    submissionHistory: [] as any[],
  });

  const params = useParams();
  const userId: string = params.userId ?? "";

  React.useEffect(() => {
    setIsLoading(true);
    let isMounted = true;

    const getUserInfo = async (userId: string) => {
      const str = "https://codeforces.com/api/user.status?handle=";
      const userInfo = await cachedUserInfo(userId);

      if (userInfo.isUserExist && userInfo.isError === false) {
        const submissions = await fetchUserSubmission(str + userId);
        const res = makeAchievementData(submissions);
        if (isMounted) {
          setIsLoading(false);
          setUserSubmission(submissions);
          setUserInfo({
            solvedCountAll: res.solvedCountAll,
            solvedCountLastYear: res.solvedCountLastYear,
            solvedCountLastMonth: res.solvedCountLastMonth,
            longestStreak: res.longestStreak,
            currentStreak: res.currentStreak,
            streakSum: res.streakSum,
            solvedHistory: makeSolvedHistory(submissions),
            submissionHistory: makeSubmissionHistory(submissions),
          });
          setIsUserExist(userInfo.isUserExist);
          setUserRating(userInfo.userRating);
        }
      } else {
        if (isMounted) {
          setIsLoading(false);
          setIsError(userInfo.isError);
          setIsUserExist(userInfo.isUserExist);
        }
      }
    };

    void getUserInfo(userId);

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const element =
    isUserExist && isError === false ? (
      <>
        <UserNameLabel userId={userId} rating={userRating} />
        <hr />
        <Achievement
          userId={userId}
          solvedCountAll={userInfo.solvedCountAll}
          solvedCountLastYear={userInfo.solvedCountLastYear}
          solvedCountLastMonth={userInfo.solvedCountLastMonth}
          longestStreak={userInfo.longestStreak}
          currentStreak={userInfo.currentStreak}
          streakSum={userInfo.streakSum}
        />
        <Climbing solvedHistory={userInfo.solvedHistory} />
        <Heatmap data={userInfo.submissionHistory} />
        <SubmissionListTable submission={userSubmission} />
      </>
    ) : isError ? (
      <ErrorMessage />
    ) : (
      <UserNotFound />
    );
  const a = isLoading ? <Loading /> : element;

  return (
    <>
      <Header userId={userId} location="user" />
      <div className="Main">{a}</div>
    </>
  );
};

export default User;
