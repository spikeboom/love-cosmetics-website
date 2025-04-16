export function extractGaSessionData(measurementId: string) {
  try {
    const cookieName = `_ga_${measurementId.replace("G-", "")}`;
    const rawCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(cookieName + "="));

    if (!rawCookie)
      return { ga_session_id: undefined, ga_session_number: undefined };

    const cookieValue = rawCookie.split("=")[1];
    const parts = cookieValue.split(".");

    return {
      ga_session_number: parts.length >= 4 ? parts[3] : undefined,
      ga_session_id: parts.length >= 9 ? parts[8] : undefined,
    };
  } catch {
    return { ga_session_id: undefined, ga_session_number: undefined };
  }
}
