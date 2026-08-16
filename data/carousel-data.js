// =============================================================
//  Carousel Posts — single source of truth
// -------------------------------------------------------------
//  Visual, swipeable breakdowns posted on Instagram / X. Each card
//  opens a quick preview of the first slide, then links out to the
//  full post — same pattern as Articles and Newsletter.
//
//  To add a carousel:
//    1. Save the slide images (in order) to /public/carousel/<id>/.
//    2. Grab the source post URL (Instagram or X).
//    3. Add an entry below.
//
//  Fields:
//    id        — unique slug / key
//    title     — the post title (shown on the card)
//    date      — ISO date "YYYY-MM-DD"
//    summary   — short brief shown in the preview
//    sourceUrl — link to the Instagram / X post (opens in a new tab)
//    slides    — array of image paths inside /public, first slide is
//                used as the card cover
//    tags      — array of tag objects from data/tags-data.js
// =============================================================

export const carouselPosts = [];

// Newest first.
export const getCarouselPostsByDate = () =>
  [...carouselPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
