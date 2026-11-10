import React from "react";
import HandleForm from "../../components/HandleForm";
import UserNotFound from "./UserNotFound";
import ErrorMessage from "../TablePage/ErrorMessage";
import Loading from "./Loading";
import UserNameLabel from "./UserNameLabel";
import Achievement from "./Achievement";
import SubmissionListTable from "./SubmissionListTable";
import Climbing from "./Climbing";
import Heatmap from "./Heatmap";
import "./UserPage.css";

import { makeSolvedHistory } from "./makeSolvedHistory";
import { makeSubmissionHistory } from "./makeSubmissionHistory";
import { makeAchievementData } from "./userUtils";
import {
  cachedSubmissionHistory,
  cachedUserInfo,
  type Submission,
} from "../../utils/TypedCachedApiClient";

type Profile = {
  userId: string;
  rating: number;
  submissions: Submission[];
  achievements: ReturnType<typeof makeAchievementData>;
  solvedHistory: ReturnType<typeof makeSolvedHistory>;
  submissionHistory: ReturnType<typeof makeSubmissionHistory>;
};

export default function User({ userId }: { userId: string }) {
  const [status, setStatus] = React.useState<
    "loading" | "success" | "not-found" | "error"
  >("loading");
  const [profile, setProfile] = React.useState<Profile>();
  const [revision, setRevision] = React.useState(0);
  const lastRevision = React.useRef(revision);

  React.useEffect(() => {
    const refresh = revision !== lastRevision.current;
    lastRevision.current = revision;
    setProfile((previous) =>
      previous?.userId === userId ? previous : undefined
    );
    if (!userId) return;
    setStatus("loading");
    let active = true;

    const load = async () => {
      try {
        // Publish the refresh to the shared cache before waiting for the profile.
        const submissionRefresh = refresh
          ? cachedSubmissionHistory(userId, true)
          : undefined;
        const info = await cachedUserInfo(userId, refresh);
        if (!active) return;
        if (!info) {
          setProfile(undefined);
          setStatus("not-found");
          return;
        }
        const submissions = await (submissionRefresh ??
          cachedSubmissionHistory(userId));
        if (!active) return;
        setProfile({
          userId,
          rating: info.userRating,
          submissions,
          achievements: makeAchievementData(submissions),
          solvedHistory: makeSolvedHistory(submissions),
          submissionHistory: makeSubmissionHistory(submissions),
        });
        setStatus("success");
      } catch {
        if (active) setStatus("error");
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [userId, revision]);

  const current = profile?.userId === userId ? profile : undefined;
  return (
    <>
      <HandleForm
        userId={userId}
        page="user"
        submitLabel="Show Stats"
        isLoading={Boolean(userId) && status === "loading"}
        onRefetch={() => setRevision((value) => value + 1)}
      />
      {!userId && (
        <p>Enter a Codeforces handle to see solved problems and activity.</p>
      )}
      {userId && status === "error" && <ErrorMessage />}
      {userId && status === "not-found" && <UserNotFound />}
      {userId && status === "loading" && !current && <Loading />}
      {current && (
        <>
          <UserNameLabel userId={userId} rating={current.rating} />
          <hr />
          <Achievement userId={userId} {...current.achievements} />
          <Climbing solvedHistory={current.solvedHistory} />
          <Heatmap data={current.submissionHistory} />
          <SubmissionListTable submission={current.submissions} />
        </>
      )}
    </>
  );
}
