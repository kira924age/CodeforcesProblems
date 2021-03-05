function formatDate(dateSecond: number): string {
  const date = new Date(dateSecond * 1000);
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const makeSubmissionHistory = (submission: any[]) => {
  let count = 0;
  let submissionHistory: any[] = [];
  const revSubmission: any[] = submission.slice().reverse();
  const numSubmission = revSubmission.length;

  for (let i = 0; i < numSubmission; i++) {
    if (
      i !== numSubmission - 1 &&
      formatDate(revSubmission[i].creationTimeSeconds) ===
        formatDate(revSubmission[i + 1].creationTimeSeconds)
    ) {
      count++;
      continue;
    }

    submissionHistory.push({
      day: formatDate(revSubmission[i].creationTimeSeconds),
      value: count + 1,
    });
    count = 0;
  }

  return submissionHistory;
};
