import React from "react";
import HandleForm, { type HandleProps } from "../../components/HandleForm";
import { cachedUserSubmissions } from "../../utils/TypedCachedApiClient";
import TableTab from "./TableTab";

const emptySubmissions = new Map<string, boolean>();

export default function TablePage({ userId, onUserIdChange }: HandleProps) {
  const [isFetchFailure, setIsFetchFailure] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(Boolean(userId));
  const [revision, setRevision] = React.useState(0);
  const lastRevision = React.useRef(revision);
  const [result, setResult] = React.useState<{
    userId: string;
    submissions: Map<string, boolean>;
  }>();
  const submissions =
    result?.userId === userId ? result.submissions : emptySubmissions;

  React.useEffect(() => {
    const refresh = revision !== lastRevision.current;
    lastRevision.current = revision;
    setIsFetchFailure(false);
    setIsLoading(Boolean(userId));
    if (!userId) return;
    let active = true;

    void cachedUserSubmissions(userId, refresh)
      .then((data) => {
        if (active) setResult({ userId, submissions: data });
      })
      .catch(() => {
        if (active) setIsFetchFailure(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, revision]);

  return (
    <>
      <HandleForm
        userId={userId}
        onUserIdChange={onUserIdChange}
        submitLabel="Show Progress"
        isLoading={Boolean(userId) && isLoading}
        onRefetch={() => setRevision((value) => value + 1)}
      />
      <TableTab submissions={submissions} isFetchFailure={isFetchFailure} />
    </>
  );
}
