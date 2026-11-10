import {
  cachedSubmissionHistory,
  cachedUserInfo,
  cachedUserSubmissions,
} from "./TypedCachedApiClient";

test("preserves the last submissions when a refresh fails across a screen change", async () => {
  const handle = "refresh-failure";
  const entry = {
    id: 1,
    creationTimeSeconds: 1,
    problem: { contestId: 100, index: "A", name: "Problem" },
    verdict: "OK",
    programmingLanguage: "C++",
  };
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(Response.json({ result: [entry] }))
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(Response.json({ result: [] }));

  try {
    const initial = await cachedSubmissionHistory(handle);
    const refresh = cachedUserSubmissions(handle, true);
    const duringRefresh = cachedSubmissionHistory(handle);

    await expect(refresh).rejects.toThrow("offline");
    await expect(duringRefresh).resolves.toBe(initial);
    await expect(cachedUserSubmissions(handle)).resolves.toEqual(
      new Map([["100A", true]])
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await expect(cachedUserSubmissions(handle, true)).resolves.toEqual(
      new Map()
    );
    await expect(cachedSubmissionHistory(handle)).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  } finally {
    fetchMock.mockRestore();
  }
});

test("preserves the profile when refreshing it fails", async () => {
  const handle = "profile-refresh-failure";
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(
      Response.json({ status: "OK", result: [{ rating: 1200 }] })
    )
    .mockRejectedValueOnce(new Error("offline"));

  try {
    const profile = await cachedUserInfo(handle);
    await expect(cachedUserInfo(handle, true)).rejects.toThrow("offline");
    await expect(cachedUserInfo(handle)).resolves.toBe(profile);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  } finally {
    fetchMock.mockRestore();
  }
});

test("evicts the least recently used submission history at the handle limit", async () => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => Response.json({ result: [] }));

  try {
    for (const handle of ["alice", "bob", "carol", "dave", "eve"]) {
      await cachedSubmissionHistory(handle);
    }
    await cachedSubmissionHistory("alice");
    await cachedSubmissionHistory("frank");
    await cachedSubmissionHistory("alice");
    expect(fetchMock).toHaveBeenCalledTimes(6);

    await cachedSubmissionHistory("bob");
    expect(fetchMock).toHaveBeenCalledTimes(7);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://codeforces.com/api/user.status?handle=bob",
      { cache: "default" }
    );
  } finally {
    fetchMock.mockRestore();
  }
});
