// =============================================================
//  Articles — our long-form posts published on X (Twitter).
// -------------------------------------------------------------
//  Reading happens on X, so each card opens a quick preview first,
//  then links out to the full post.
//
//  To add an article:
//    1. Grab the X post URL (https://x.com/notintofinance/status/ID)
//    2. Save the post's preview image to /public/article/covers/
//    3. Add an entry below (write a one or two line `summary`).
//
//  Fields:
//    id      — unique slug / key
//    title   — the article title (shown on the card)
//    date    — ISO date "YYYY-MM-DD"
//    summary — short brief shown in the preview
//    url     — link to the X post (opens in a new tab)
//    cover   — preview image path inside /public
// =============================================================

export const articles = [
  {
    id: "msti-mastersystem-infotama",
    title: "$MSTI — Mastersystem Infotama Tbk",
    date: "2026-04-16",
    summary:
      "A closer look at Mastersystem Infotama (MSTI) and what makes the IT infrastructure player worth watching.",
    url: "https://x.com/notintofinance/status/2044628386904219809",
    cover: "/article/covers/article-1.jpg",
  },
  {
    id: "krisis-hormuz-rantai-pasok-logam",
    title:
      "Krisis Hormuz dan Rejeki Nomplok Indonesia: Perebutan Tahta Baru Rantai Pasok Logam",
    date: "2026-04-20",
    summary:
      "How tensions around the Strait of Hormuz could reshuffle the global metals supply chain, and where Indonesia stands to gain.",
    url: "https://x.com/notintofinance/status/2046172814148039144",
    cover: "/article/covers/article-2.jpg",
  },
  {
    id: "deal-eurasia-sawit-tekstil",
    title: "Efek Deal Eurasia: Ekspor Sawit & Tekstil Siap Meroket?",
    date: "2026-04-23",
    summary:
      "What a new Eurasia trade deal could mean for Indonesia's palm oil and textile exports.",
    url: "https://x.com/notintofinance/status/2047303846490505573",
    cover: "/article/covers/article-3.jpg",
  },
  {
    id: "supply-shock-450-kiloton-inco",
    title: "Supply Shock 450 Kiloton: Krisis sebagai Peluang bagi INCO",
    date: "2026-04-29",
    summary:
      "A 450-kiloton nickel supply shock, and why the disruption could turn into an opportunity for INCO.",
    url: "https://x.com/notintofinance/status/2049306002080854343",
    cover: "/article/covers/article-4.jpg",
  },
  {
    id: "paradoks-hilirisasi-aluminium",
    title:
      "Paradoks Hilirisasi: Bagaimana Larangan Ekspor RI Menambal Celah Suplai Aluminium Global",
    date: "2026-05-01",
    summary:
      "How Indonesia's export restrictions are quietly filling a gap in the global aluminium supply.",
    url: "https://x.com/notintofinance/status/2050064502365053213",
    cover: "/article/covers/article-5.jpg",
  },
  {
    id: "pemerintah-incar-pajak-tambang",
    title:
      "Pemerintah Incar Pajak Tambang: Cuan Negara Nambah, Memang Asing Bakal Betah?",
    date: "2026-05-06",
    summary:
      "The push for higher mining taxes: good for state revenue, but will foreign investors stick around?",
    url: "https://x.com/notintofinance/status/2051914442829398238",
    cover: "/article/covers/article-6.jpg",
  },
  {
    id: "sentralisasi-ekspor-prabowo",
    title:
      "Sentralisasi Ekspor Prabowo: Mahakarya Fiskal atau Blunder Logistik?",
    date: "2026-05-23",
    summary:
      "Prabowo's plan to centralise exports: a fiscal masterstroke, or a logistical headache?",
    url: "https://x.com/notintofinance/status/2058055729337286975",
    cover: "/article/covers/article-7.jpg",
  },
  {
    id: "bank-sentral-borong-emas",
    title:
      "Bank Sentral Kembali Borong Emas di April, Tapi Mengapa Harga Emas Malah Tertekan di Juni 2026?",
    date: "2026-06-06",
    summary:
      "Central banks kept buying gold in April, so why did the price slip in June 2026?",
    url: "https://x.com/notintofinance/status/2063136939319132545",
    cover: "/article/covers/article-8.jpg",
  },
  {
    id: "prediksi-piala-dunia-2026",
    title:
      "Prediksi Juara Piala Dunia 2026: Quantitative Model vs Market Prediction",
    date: "2026-06-07",
    summary:
      "Predicting the 2026 World Cup winner: a quantitative model versus the betting market.",
    url: "https://x.com/notintofinance/status/2063599859945627884",
    cover: "/article/covers/article-9.jpg",
  },
  {
    id: "trump-let-the-oil-flow",
    title: "Trump Bilang 'Let The Oil Flow' — Fed Bilang 'Not So Fast'",
    date: "2026-06-16",
    summary:
      "Trump wants cheaper oil, the Fed is wary. What the tug-of-war could mean for markets.",
    url: "https://x.com/notintofinance/status/2066920412207075694",
    cover: "/article/covers/article-10.jpg",
  },
];

// Newest first.
export const getArticlesByDate = () =>
  [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
