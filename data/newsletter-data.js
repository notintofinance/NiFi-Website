// =============================================================
//  Newsletter Archive — single source of truth
// -------------------------------------------------------------
//  Reading happens on Beehiiv, so each card opens a quick preview
//  first, then links out to the full issue — same pattern as Articles.
//
//  To add an issue:
//    1. Grab the issue's public Beehiiv URL.
//    2. Save a cover/thumbnail image to /public/newsletter/covers/.
//    3. Add an entry below.
//
//  Fields:
//    id      — unique slug / key
//    title   — the issue title (shown on the card)
//    date    — ISO date "YYYY-MM-DD"
//    summary — short brief shown in the preview
//    url     — link to the Beehiiv issue (opens in a new tab)
//    cover   — preview image path inside /public
//    tags    — array of tag objects from data/tags-data.js
// =============================================================

export const newsletterIssues = [];

// Newest first.
export const getNewsletterIssuesByDate = () =>
  [...newsletterIssues].sort((a, b) => new Date(b.date) - new Date(a.date));
