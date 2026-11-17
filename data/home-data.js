// =============================================================
//  Home content in two languages (Indonesian and English).
// -------------------------------------------------------------
//  Everything here is NiFi's own material:
//    - summaries  → the research and articles in research-data.js
//                   and article-data.js (titles stay as published)
//    - primers    → the five primers from learn-data.js, edited
//                   for plain wording in both languages
//  Nothing is sample content. Interface text (buttons, headings)
//  lives in data/copy.js.
// =============================================================

const pick = (lang) => (value) => value[lang] ?? value.id;

// Hero cards: a finance term on the front, plain language on the back.
// `hue` is a key of tokens.play in design-tokens.js.
const jargon = [
  {
    hue: "pink",
    id: { term: "Inflasi", meaning: "Harga barang naik dari waktu ke waktu, jadi uang yang sama dapat lebih sedikit." },
    en: { term: "Inflation", meaning: "Prices rise over time, so the same money buys less." },
  },
  {
    hue: "blue",
    id: { term: "Saham", meaning: "Bukti kamu ikut memiliki sebagian kecil sebuah perusahaan." },
    en: { term: "Stocks", meaning: "Proof that you own a small part of a company." },
  },
  {
    hue: "cyan",
    id: { term: "Obligasi", meaning: "Surat utang: kamu meminjamkan uang, lalu dibayar bunga." },
    en: { term: "Bonds", meaning: "A loan you make to a government or company, which pays you interest." },
  },
  {
    hue: "violet",
    id: { term: "Reksa dana", meaning: "Uang banyak investor dikumpulkan, lalu dikelola manajer investasi." },
    en: { term: "Mutual funds", meaning: "Money from many investors, pooled and run by a fund manager." },
  },
  {
    hue: "cyan",
    id: { term: "Dividen", meaning: "Bagian laba perusahaan yang dibagikan ke pemegang saham." },
    en: { term: "Dividends", meaning: "The part of a company's profit paid out to shareholders." },
  },
  {
    hue: "pink",
    id: { term: "Diversifikasi", meaning: "Membagi uang ke beberapa aset supaya risikonya tersebar." },
    en: { term: "Diversification", meaning: "Spreading money across several assets to spread the risk." },
  },
  {
    hue: "blue",
    id: { term: "Bunga majemuk", meaning: "Bunga yang ikut berbunga dari waktu ke waktu." },
    en: { term: "Compound interest", meaning: "Interest that earns interest of its own over time." },
  },
  {
    hue: "violet",
    id: { term: "Valuasi", meaning: "Cara menaksir berapa nilai wajar sebuah perusahaan." },
    en: { term: "Valuation", meaning: "Working out what a company is reasonably worth." },
  },
  {
    hue: "cyan",
    id: { term: "Likuiditas", meaning: "Seberapa cepat sebuah aset bisa dijadikan uang tunai." },
    en: { term: "Liquidity", meaning: "How quickly an asset can be turned into cash." },
  },
];
export const getJargon = (lang) => jargon.map((j) => ({ hue: j.hue, ...pick(lang)(j) }));

// Topic filters for the research explorer (labels are in data/copy.js).
export const topics = ["stocks", "commodities", "energy", "macro", "other"];

// Topics and a one-line summary for each real report and article.
export const contentMeta = {
  // Research reports (PDF)
  "indonesiawit-palm-oil": {
    topics: ["commodities"],
    id: "Sektor kelapa sawit Indonesia dan alasan untuk meliriknya.",
    en: "Indonesia's palm oil sector, and the case for it.",
  },
  "new-alternative-energy": {
    topics: ["energy"],
    id: "Energi alternatif dan terbarukan, serta ke mana peluangnya mungkin mengarah.",
    en: "Alternative and renewable energy, and where the opportunity may be heading.",
  },
  "lpck-lippo-cikarang": {
    topics: ["stocks"],
    id: "Riset ekuitas Lippo Cikarang (LPCK), pengembang kawasan industri dan properti.",
    en: "Equity research on Lippo Cikarang (LPCK), an industrial estate and property developer.",
  },
  "amman-aku-kamu-amman": {
    topics: ["stocks", "commodities"],
    id: "Amman Mineral (AMMN), penambang tembaga dan emas Indonesia, dan cara pikir jangka panjang di baliknya.",
    en: "Amman Mineral (AMMN), Indonesia's copper and gold miner, and the long-term thinking behind it.",
  },
  "pbrx-garment-giant": {
    topics: ["stocks"],
    id: "Riset ekuitas Pan Brothers (PBRX): bisakah produsen garmen ini pulih?",
    en: "Equity research on Pan Brothers (PBRX): can the garment maker turn itself around?",
  },
  // Articles (published on X)
  "msti-mastersystem-infotama": {
    topics: ["stocks"],
    id: "Mastersystem Infotama (MSTI), perusahaan infrastruktur TI, dan alasan kami memantaunya.",
    en: "Mastersystem Infotama (MSTI), an IT infrastructure company, and why we are watching it.",
  },
  "krisis-hormuz-rantai-pasok-logam": {
    topics: ["commodities", "macro"],
    id: "Bagaimana ketegangan di Selat Hormuz bisa mengubah rantai pasok logam dunia, dan di mana Indonesia bisa diuntungkan.",
    en: "How tension around the Strait of Hormuz could reshuffle the global metals supply chain, and where Indonesia could gain.",
  },
  "deal-eurasia-sawit-tekstil": {
    topics: ["commodities"],
    id: "Arti kesepakatan dagang Eurasia yang baru bagi ekspor sawit dan tekstil Indonesia.",
    en: "What a new Eurasia trade deal could mean for Indonesia's palm oil and textile exports.",
  },
  "supply-shock-450-kiloton-inco": {
    topics: ["stocks", "commodities"],
    id: "Guncangan pasokan nikel 450 kiloton, dan kenapa ini bisa jadi peluang bagi INCO.",
    en: "A 450-kiloton nickel supply shock, and why it could be an opportunity for INCO.",
  },
  "paradoks-hilirisasi-aluminium": {
    topics: ["commodities", "macro"],
    id: "Bagaimana pembatasan ekspor Indonesia menutup celah pasokan aluminium dunia.",
    en: "How Indonesia's export restrictions are filling a gap in global aluminium supply.",
  },
  "pemerintah-incar-pajak-tambang": {
    topics: ["macro", "commodities"],
    id: "Pajak tambang yang lebih tinggi menambah penerimaan negara. Apakah investor asing akan bertahan?",
    en: "Higher mining taxes would raise state revenue. Will foreign investors stay?",
  },
  "sentralisasi-ekspor-prabowo": {
    topics: ["macro"],
    id: "Rencana Prabowo memusatkan ekspor: kebijakan fiskal yang bagus, atau masalah logistik?",
    en: "Prabowo's plan to centralise exports: good fiscal policy, or a logistics problem?",
  },
  "bank-sentral-borong-emas": {
    topics: ["commodities", "macro"],
    id: "Bank sentral terus membeli emas di April, lalu kenapa harganya turun di Juni 2026?",
    en: "Central banks kept buying gold in April, so why did the price fall in June 2026?",
  },
  "prediksi-piala-dunia-2026": {
    topics: ["other"],
    id: "Menebak juara Piala Dunia 2026: model kuantitatif melawan pasar taruhan.",
    en: "Predicting the 2026 World Cup winner: a quantitative model against the betting market.",
  },
  "trump-let-the-oil-flow": {
    topics: ["energy", "macro"],
    id: "Trump ingin minyak lebih murah, sementara The Fed masih waspada. Apa artinya bagi pasar.",
    en: "Trump wants cheaper oil and the Fed is wary. What that could mean for markets.",
  },
};

// Beginner path: the five primers (same slugs and order as learn-data.js).
const primers = [
  {
    key: "investing-101",
    id: {
      title: "Investing 101",
      summary: "Titik awal kalau kamu belum pernah berinvestasi sama sekali.",
      body: [
        "Berinvestasi berbeda dari menabung. Uang tabungan aman dan jumlahnya kurang lebih tetap. Uang yang diinvestasikan bisa bertumbuh, tapi nilainya akan naik-turun selama prosesnya.",
        "Kamu tidak perlu modal besar untuk mulai. Kebiasaannya lebih penting daripada jumlahnya: setor secara rutin, pilih investasi yang kamu pahami, dan beri waktu. Investor pemula biasanya lebih banyak rugi karena panik menjual saat harga turun daripada karena salah memilih saham.",
        "Rekening sekuritas hanya alat untuk membeli dan menjual. Sebelum membukanya, jawab dua hal dengan jujur: berapa lama uang itu bisa kamu biarkan, dan bagaimana perasaanmu kalau nilainya turun 20% dalam sebulan. Jawabanmu menentukan sebagian besar keputusan setelahnya.",
        "Primer lain di jalur ini (pasar, risiko, makro, valuasi) mengisi detailnya.",
      ],
    },
    en: {
      title: "Investing 101",
      summary: "Where to start if you have never invested a rupiah.",
      body: [
        "Investing is different from saving. Savings stay safe and roughly the same size. Invested money can grow, but its value will go up and down along the way.",
        "You don't need much to start. The habit matters more than the amount: put money in regularly, choose investments you understand, and give them time. Inexperienced investors usually lose more by panic selling after a drop than by picking the wrong stock.",
        "A brokerage account is only the tool for buying and selling. Before you open one, be honest about two things: how long you can leave the money invested, and how you would feel watching it fall 20% in a bad month. Your answers shape most of the decisions that follow.",
        "The other primers here (markets, risk, macro, valuation) fill in the details.",
      ],
    },
  },
  {
    key: "markets",
    id: {
      title: "Pasar",
      summary: "Apa yang terjadi saat kamu memasang order, dan kenapa harga bergerak.",
      body: [
        "Pasar adalah sistem pencocokan. Orang yang ingin membeli bertemu orang yang ingin menjual, lalu mereka sepakat di satu harga. Saat kamu memasang order, lawan transaksimu adalah orang atau institusi lain.",
        "Harga bergerak ketika keseimbangan itu bergeser. Informasi baru, misalnya laba perusahaan, keputusan suku bunga bank sentral, atau kebijakan ekspor, mengubah harga yang mau dibayar pembeli dan diterima penjual. Harga lalu menyesuaikan sampai kedua pihak bertemu lagi.",
        "Likuiditas adalah seberapa mudah kamu membeli atau menjual tanpa ikut menggerakkan harga. Saham yang ramai diperdagangkan hampir tidak terpengaruh order kamu. Saham yang sepi bisa melonjak karena satu transaksi. Cek dulu kamu sedang berhadapan dengan yang mana sebelum menganggap harga di layar adalah harga yang akan kamu dapat.",
        "Banyak pergerakan harga harian yang terlihat kacau sebenarnya adalah proses pencocokan ini bereaksi terhadap informasi baru. Itu sebabnya pergerakan satu hari biasanya tidak berarti banyak, dan tren berbulan-bulan lebih informatif daripada tren beberapa jam.",
      ],
    },
    en: {
      title: "Markets",
      summary: "What happens when you place an order, and why prices move.",
      body: [
        "A market is a matching system. People who want to buy meet people who want to sell, and they agree on a price. When you place an order, the other side of the trade is another person or firm.",
        "Prices move when that balance shifts. New information, such as a company's earnings, a central bank's rate decision or an export policy, changes what buyers will pay and what sellers will accept. The price adjusts until the two sides meet again.",
        "Liquidity is how easily you can buy or sell without moving the price yourself. A heavily traded stock barely notices your order. A thinly traded one can jump on a single trade. Check which kind you are dealing with before you assume the price on the screen is the price you will get.",
        "Much of what looks like chaos in daily prices is this matching process reacting to new information. That is why a single day's swing is usually noise, and why the trend over months tells you more than the trend over hours.",
      ],
    },
  },
  {
    key: "risk",
    id: {
      title: "Risiko",
      summary: "Berapa yang bisa hilang, dan apakah kamu sanggup menerimanya.",
      body: [
        "Setiap keputusan investasi punya dua sisi: keuntungan yang kamu harapkan, dan kerugian yang kamu terima untuk mengejarnya. Kebanyakan pemula hampir hanya memperhatikan yang pertama.",
        "Toleransi risiko adalah pertanyaan praktis tentang situasimu. Uang yang akan dipakai tahun depan tidak bisa menanggung risiko sebesar uang yang tidak akan disentuh selama sepuluh tahun.",
        "Diversifikasi adalah cara paling sederhana mengelola risiko. Kamu tidak menaruh semuanya di satu perusahaan, satu sektor, atau satu taruhan, sehingga satu hasil buruk tidak menjatuhkan seluruh portofolio. Kamu tetap bisa rugi, tapi satu kesalahan tidak lagi menentukan segalanya.",
        "Ukuran posisi adalah seberapa besar porsi portofolio untuk satu ide, dan ini sama pentingnya dengan ide yang kamu pilih. Keputusan bagus dengan porsi terlalu besar tetap bisa merugikan kalau ternyata salah. Keputusan biasa saja dengan porsi wajar biasanya tidak.",
      ],
    },
    en: {
      title: "Risk",
      summary: "How much you could lose, and whether you can live with it.",
      body: [
        "Every investment decision has two parts: the gain you hope for, and the loss you accept to go after it. Most beginners spend nearly all their attention on the first.",
        "Risk tolerance is a practical question about your situation. Money you will need next year can take far less risk than money you won't touch for ten years.",
        "Diversification is the simplest way to manage risk. You avoid putting everything into one company, one sector or one bet, so a single bad outcome can't take the whole portfolio down. You can still lose money, but one mistake no longer decides everything.",
        "Position sizing is how much of your portfolio goes into a single idea, and it matters as much as which idea you pick. A good call that is sized too large can still hurt badly if it turns out wrong. A mediocre call at a sensible size usually can't.",
      ],
    },
  },
  {
    key: "macro",
    id: {
      title: "Makro",
      summary: "Suku bunga, inflasi, nilai tukar, dan kebijakan pemerintah: hal-hal yang menggerakkan seluruh pasar.",
      body: [
        "Makro mempelajari hal-hal di tingkat ekonomi yang berada di atas perusahaan mana pun: suku bunga, inflasi, nilai tukar, serta kebijakan dagang dan ekspor. Kamu bisa memilih perusahaan terbaik di Indonesia dan sahamnya tetap bisa terseret keputusan Bank Indonesia atau The Fed.",
        "Suku bunga biasanya paling besar pengaruhnya. Saat suku bunga naik, pinjaman jadi lebih mahal bagi perusahaan dan konsumen, sehingga pertumbuhan cenderung melambat dan uang pindah ke aset yang lebih aman. Saat suku bunga turun, yang terjadi sebaliknya. Mekanisme ini menjelaskan sebagian besar pergerakan pasar di tahun mana pun.",
        "Di tingkat lokal, kebijakan sama pentingnya: larangan ekspor, pajak tambang, kesepakatan dagang. Ekonomi Indonesia banyak bergantung pada komoditas, sehingga satu perubahan aturan ekspor sawit atau nikel bisa merambat ke beberapa sektor. Riset dan artikel kami banyak menelusuri hubungan seperti ini.",
        "Kamu tidak harus bisa meramal makro untuk berinvestasi dengan baik. Kamu perlu cukup memahaminya untuk tahu kenapa perusahaan yang bagus bisa mengalami tahun yang buruk, dan kenapa itu saja belum tentu alasan untuk menjual.",
      ],
    },
    en: {
      title: "Macro",
      summary: "Interest rates, inflation, currency and government policy: the forces that move whole markets.",
      body: [
        "Macro is the study of economy-wide forces that sit above any single company: interest rates, inflation, currency moves, and trade and export policy. You can pick the best company in Indonesia and still watch its stock get pulled around by decisions at Bank Indonesia or the Fed.",
        "Interest rates are usually the biggest lever. When rates rise, borrowing gets more expensive for companies and consumers, so growth tends to slow and money moves toward safer assets. When rates fall, the opposite happens. That mechanism explains a large share of market moves in any given year.",
        "Policy matters just as much locally: export bans, mining taxes, trade deals. Indonesia's economy leans heavily on commodities, so one change to palm oil or nickel export rules can spread across several sectors. Our research and articles spend a lot of time tracing those links.",
        "You don't have to predict macro to invest well. You do need to understand it well enough to see why a good company can have a bad year, and why that alone may not be a reason to sell.",
      ],
    },
  },
  {
    key: "valuation",
    id: {
      title: "Valuasi",
      summary: "Menaksir berapa nilai sebuah perusahaan. Ini keahlian di balik setiap riset yang kami terbitkan.",
      body: [
        "Valuasi menjawab satu pertanyaan: apakah perusahaan ini bernilai lebih atau kurang dari harga yang dipasang pasar? Harga adalah yang kamu bayar, nilai adalah yang kamu dapat. Keduanya tidak selalu sama, dan di selisihnya biasanya ada peluang atau tanda bahaya.",
        "Cara cepat yang paling umum adalah membandingkan harga perusahaan dengan sesuatu yang dihasilkannya, misalnya laba (rasio P/E) atau arus kas. Rasio yang lebih rendah dari perusahaan sejenis bisa berarti sahamnya murah. Bisa juga berarti pasar punya alasan kuat untuk memperkirakan masalah. Anggap rasio sebagai pertanyaan pertama.",
        "Valuasi yang layak melihat bisnisnya: apa yang dikerjakan, bagaimana menghasilkan uang, apa yang bisa berjalan baik, apa yang bisa salah, dan apakah harganya sudah mencerminkan semua itu. Prosesnya lebih lama daripada membaca satu rasio, tapi kesimpulanmu jadi punya dasar.",
        "Setiap laporan ekuitas kami, termasuk LPCK, AMMN, dan PBRX, menjalankan proses ini untuk perusahaan sungguhan. Membaca salah satunya sambil membuka primer ini adalah cara tercepat melihat valuasi dipakai.",
      ],
    },
    en: {
      title: "Valuation",
      summary: "Estimating what a company is worth. It is the skill behind every research report we publish.",
      body: [
        "Valuation answers one question: is this company worth more or less than the market is charging for it? Price is what you pay and value is what you get. The two are not always the same, and the gap between them is usually where you find the opportunity or the warning sign.",
        "The most common shortcut is to compare a company's price with something it produces, such as earnings (the P/E ratio) or cash flow. A lower ratio than similar companies can mean the stock is cheap. It can also mean the market has good reason to expect trouble. Treat the ratio as a first question.",
        "A proper valuation looks at the business: what it does, how it makes money, what could go right, what could go wrong, and whether the price already reflects all of that. It takes longer than reading one ratio, but you end up reasoning instead of guessing.",
        "Each of our equity reports, including LPCK, AMMN and PBRX, works through this process for a real company. Reading one next to this primer is the quickest way to see valuation applied.",
      ],
    },
  },
];
export const primerIds = primers.map((p) => p.key);
export const getPrimers = (lang) => primers.map((p) => ({ id: p.key, ...pick(lang)(p) }));

// Community: real NiFi photos (public/community, public/content/events).
const moments = [
  {
    src: "/content/events/doo-financial-event.jpg",
    w: 1600,
    h: 1066,
    id: { alt: "Anggota komunitas NiFi dan tamu berfoto bersama di event dengan Doo Financial", caption: "Event dengan Doo Financial" },
    en: { alt: "NiFi community members and guests in a group photo at an event with Doo Financial", caption: "Event with Doo Financial" },
  },
  {
    src: "/community/activity-ramadan.jpg",
    w: 1600,
    h: 1200,
    id: { alt: "Anggota komunitas NiFi berkumpul di acara meetup bulan Ramadan", caption: "Meetup komunitas" },
    en: { alt: "NiFi community members gathered at a Ramadan meetup", caption: "Community meetup" },
  },
  {
    src: "/community/activity-dinner.jpg",
    w: 1200,
    h: 1600,
    id: { alt: "Anggota komunitas NiFi makan malam bersama", caption: "Makan malam bersama" },
    en: { alt: "NiFi community members having dinner together", caption: "Group dinner" },
  },
  {
    src: "/community/nifiberbagi-1.jpg",
    w: 1600,
    h: 900,
    id: { alt: "Relawan NiFi di kegiatan #NiFiBerbagi, wajah disamarkan demi privasi", caption: "#NiFiBerbagi" },
    en: { alt: "NiFi volunteers at a #NiFiBerbagi activity, faces blurred for privacy", caption: "#NiFiBerbagi" },
  },
];
export const getMoments = (lang) => moments.map((m) => ({ src: m.src, w: m.w, h: m.h, ...pick(lang)(m) }));

// One line per business offering (ids match data/business-data.js; the For
// Business page has the full detail).
export const businessShort = {
  id: {
    "brand-placement": "Brand kamu tampil di konten berbasis riset di kanal NiFi.",
    events: "Sponsori event, bootcamp, dan kegiatan komunitas NiFi.",
    academy: "Kelas online dan program inkubasi riset ekuitas.",
    arthara: "Platform analisis saham Indonesia dari NiFi.",
  },
  en: {
    "brand-placement": "Your brand in research-led content on NiFi's channels.",
    events: "Sponsor NiFi events, bootcamps and community activities.",
    academy: "Online classes and an equity research incubation program.",
    arthara: "NiFi's stock analysis platform for Indonesia.",
  },
};
