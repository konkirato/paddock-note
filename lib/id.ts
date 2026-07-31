// crypto.randomUUID() requires a secure context (HTTPS or localhost), so it's
// unavailable when testing over a plain-HTTP LAN address (e.g. from a phone).
// This fallback keeps race creation working in that case; these ids are not
// security-sensitive (Postgres RLS is the actual access boundary).
export function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
