/** No untrusted markup, sessions, scripts, forms or external navigation in the demo. */
export const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
export function embedPolicy(extra = process.env.PORTFOLIO_EMBED_ORIGINS ?? "") {
  const origins = ["https://kevinzieyeo.com"];
  for (const value of extra.split(",").map(v => v.trim()).filter(Boolean)) {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.origin !== value || url.username || url.password || url.hostname.includes("*")) throw new Error("Invalid embed parent origin");
    origins.push(url.origin);
  }
  return `default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src 'self'; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-ancestors ${[...new Set(origins)].join(" ")}`;
}
export function publicImage(value: unknown) {
  try { const url = new URL(String(value)); return url.protocol === "https:" && !url.username && !url.password ? escapeHtml(url.href) : ""; } catch { return ""; }
}
