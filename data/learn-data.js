// =============================================================
//  Learn — plain-language topic explainers.
// -------------------------------------------------------------
//  Each topic is a short, jargon-free primer, tagged the same way as
//  Hub content so a topic page can surface the research/articles that
//  already touch it (see /learn/[slug]).
//
//  To add a topic:
//    1. Add a new object below (order = the order it appears on /learn).
//    2. `body` is an array of paragraphs, rendered one per <p>.
//    3. `tags` should include at least the matching entry from
//       data/tags-data.js so it cross-links with tagged Hub content.
//
//  Fields:
//    id      — unique slug (used in the URL and as the React key)
//    title   — topic name
//    summary — one-line description shown on the /learn index card
//    body    — array of paragraph strings for the full explainer
//    tags    — array of tag objects from data/tags-data.js
// =============================================================

import { TAGS } from "./tags-data";

export const learnTopics = [
  {
    id: "investing-101",
    title: "Investing 101",
    summary:
      "Before valuation, before macro, before risk — the absolute starting point if you've never invested a rupiah.",
    body: [
      "Investing is different from saving. Saving keeps money safe and roughly where it is; investing puts money to work so it can grow, in exchange for accepting that its value can go up or down along the way.",
      "You don't need a lot to start. What matters more than the amount is the habit: putting money in regularly, choosing investments you actually understand, and giving them time. Most of the damage inexperienced investors do to themselves comes from panic-selling after a drop, not from picking the wrong stock.",
      "A brokerage account is just the tool that lets you buy and sell — think of it as the door, not the destination. Before walking through it, it's worth being honest about two things: how long you can leave the money invested, and how you'll actually feel watching it drop 20% in a bad month. Both answers shape everything else you do.",
      "Everything else on this page — markets, risk, macro, valuation — is really just filling in the details behind that starting point.",
    ],
    tags: [TAGS.investing101],
  },
  {
    id: "markets",
    title: "Markets",
    summary:
      "What actually happens when you place an order, and why prices move the way they do.",
    body: [
      "A market is just a matching system: people who want to buy something and people who want to sell it, meeting on price. When you place an order, you're not trading with \"the market\" as some abstract force — you're trading with another person or firm on the other side, right now.",
      "Prices move because that balance shifts. New information — a company's earnings, a central bank's rate decision, an export policy — changes what buyers are willing to pay or what sellers are willing to accept, and the price adjusts to find a new balance.",
      "Liquidity is how easily you can buy or sell without moving the price much yourself. A stock that trades constantly in huge volume barely notices your order; a thin, rarely-traded one can jump on a single trade. It's worth knowing which kind of market you're in before you assume the price you see is the price you'll get.",
      "A lot of what looks like chaos in daily price moves is just this matching process reacting to new information in real time — which is exactly why single-day swings are usually noise, and the trend over months matters more than the trend over hours.",
    ],
    tags: [TAGS.markets],
  },
  {
    id: "risk",
    title: "Risk",
    summary:
      "Not \"how much can I make\" but \"how much can I lose, and can I actually live with that.\"",
    body: [
      "Every investment decision is really two decisions stacked together: the upside you're hoping for, and the downside you're accepting to get it. Most beginners spend all their attention on the first one and almost none on the second.",
      "Risk tolerance isn't a personality trait you either have or don't — it's a practical question about your own situation. Money you'll need in a year behaves very differently, in terms of what you can risk, than money you won't touch for a decade.",
      "Diversification is the simplest risk tool there is: not putting everything into one company, one sector, or one bet, so that a single bad outcome doesn't take the whole portfolio down with it. It won't stop you from losing money, but it stops one mistake from becoming the only thing that matters.",
      "Position sizing — how much of your portfolio goes into any single idea — matters just as much as which idea you pick. A great call sized too large can still hurt you badly if it's wrong; a mediocre call sized sensibly usually can't.",
    ],
    tags: [TAGS.risk],
  },
  {
    id: "macro",
    title: "Macro",
    summary:
      "Interest rates, inflation, currency, government policy — the forces that move whole markets, not just single stocks.",
    body: [
      "Macro is the study of the big, economy-wide forces that sit above any individual company — interest rates, inflation, currency moves, trade and export policy. You can pick the best company in Indonesia and still watch its stock get pulled around by decisions made at Bank Indonesia or the Fed.",
      "Interest rates are usually the biggest lever. When rates rise, borrowing gets more expensive for companies and consumers alike, which tends to cool growth and pull money toward safer assets; when they fall, the opposite happens. That single mechanism explains a large share of what moves markets in any given year.",
      "Policy — export bans, mining taxes, trade deals — matters just as much locally. Indonesia's commodity-heavy economy means a single policy shift on palm oil or nickel exports can ripple through entire sectors, which is exactly the kind of connection our research and articles spend a lot of time tracing.",
      "You don't need to predict macro to invest well, but you do need to understand it enough to know why a genuinely good company can still have a bad year — and why that isn't necessarily a reason to sell.",
    ],
    tags: [TAGS.macro],
  },
  {
    id: "valuation",
    title: "Valuation",
    summary:
      "The core skill behind every research report we publish: putting a number on what a company is actually worth.",
    body: [
      "Valuation answers one question: is this company worth more or less than what the market is currently charging for it? Price is what you pay; value is what you're actually getting. The two aren't always the same, and the gap between them is where the opportunity — or the warning sign — usually lives.",
      "The most common shortcut is comparing a company's price to something concrete it produces, like earnings (the P/E ratio) or cash flow. A lower ratio than similar companies can mean it's undervalued — or it can mean the market has good reason to expect trouble ahead. The ratio is a starting question, never a final answer.",
      "A proper valuation looks at the business itself: what it actually does, how it makes money, what could go right, what could go wrong, and whether its price already reflects all of that. It's slower than a one-line ratio, but it's the difference between guessing and reasoning.",
      "Every equity report in our Hub — LPCK, AMMN, PBRX, and the rest — is a worked example of exactly this process. Reading one alongside this page is the fastest way to see valuation applied to a real company instead of in the abstract.",
    ],
    tags: [TAGS.valuation],
  },
];

export const getLearnTopicBySlug = (slug) =>
  learnTopics.find((t) => t.id === slug) ?? null;
