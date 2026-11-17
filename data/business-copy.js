// =============================================================
//  For Business page text in Indonesian and English.
// -------------------------------------------------------------
//  Structure (ids, images, partner logos, class list) stays in
//  data/business-data.js; this file holds the words. Facts are
//  the same in both languages and follow the NiFi Partnership
//  Deck 2026 and arthara.id. No prices or audience numbers.
// =============================================================

export const businessCopy = {
  id: {
    eyebrow: "For Business",
    headline: ["Terbuka untuk", "kolaborasi."],
    sub: "NiFi bekerja sama dengan brand dan organisasi yang ingin menjangkau orang yang mengikuti finance dan investasi. Caranya lewat konten, event, NiFi Academy, dan Arthara.",
    discuss: "Diskusikan kerja sama",
    seeServices: "Lihat layanan",
    mailSubject: "Kerja sama dengan Not Into Finance",
    kinds: { Service: "Layanan", Platform: "Platform" },
    canInclude: "Bisa mencakup",
    formats: "Format penempatan",
    format: "Format",
    addOn: "Add-on",
    examplesNote: "Contoh di atas adalah post NiFi sendiri untuk menunjukkan gayanya. Post itu tidak bersponsor.",
    program: "Program",
    pastClasses: "Kelas online yang sudah berjalan",
    pastClassesLabel: "Kelas online NiFi yang sudah berjalan",
    classAlt: (title, speaker) => `Poster kelas NiFi "${title}" dengan ${speaker}`,
    incubationAlt: 'Poster program NiFi Academy Incubation "Research to Win"',
    exploreArthara: "Buka Arthara",
    agreed: "Format, ruang lingkup, dan hasil kerja disepakati untuk tiap kolaborasi.",
    partnersTitle: "Partnership sebelumnya",
    partnersBody: "Organisasi yang pernah bekerja sama dengan NiFi, dikelompokkan menurut jenis kerja samanya.",
    groups: { academy: "Partner NiFi Academy", partners: "Business Partners" },
    closingTitle: "Mari bekerja sama.",
    closingBody: "Ceritakan brand atau organisasimu dan rencana yang kamu pikirkan. Kami akan membalas lewat email.",
    incubation: {
      summary: "Program untuk mahasiswa S1 Indonesia yang berfokus pada penulisan riset ekuitas untuk kompetisi, dengan mentor dari industri keuangan.",
      steps: ["Open recruitment", "Inkubasi dengan mentor", "Company visit", "Kelulusan"],
    },
    events: [
      { alt: "Anggota komunitas NiFi dan tamu berfoto bersama di event dengan Doo Financial", caption: "Event NiFi dengan Doo Financial" },
      { alt: "Anggota komunitas NiFi berkumpul di sebuah meetup", caption: "Meetup komunitas NiFi" },
      { alt: "Relawan NiFi di kegiatan amal #NiFiBerbagi, wajah ditutup demi privasi", caption: "Kegiatan amal #NiFiBerbagi" },
    ],
    services: {
      "brand-placement": {
        lead: "Brand kamu masuk ke konten finance yang berbasis riset. Tim NiFi menulis dan mendesain setiap kontennya, lalu menerbitkannya di kanal NiFi.",
        includes: [],
        formats: [
          {
            name: "Instagram + X",
            items: ["1 feed post di Instagram", "1 post di X", "Teks dan desain oleh tim NiFi", "Brand disebut dan di-tag di caption"],
            alt: "Post NiFi Journal di Instagram",
            caption: "Contoh: post NiFi Journal",
          },
          {
            name: "Video di Reels, TikTok & X",
            items: [
              "1 video di Instagram Reels, TikTok, dan X",
              "1 feed post di Instagram",
              "Naskah, syuting, dan editing oleh NiFi",
              "Hak penuh atas konten untuk brand kamu",
              "Brand disebut dan di-tag di caption",
            ],
            alt: "Video penjelasan pendek dari NiFi",
            caption: "Contoh: video pendek NiFi",
          },
        ],
        addOn: "Promosi berbayar bisa ditambahkan di luar jangkauan organik kami.",
      },
      events: {
        lead: "Jangkau komunitas NiFi secara online, tatap muka, dan di Discord. Kami mengadakan kelas online dan kegiatan amal #NiFiBerbagi, bootcamp, meetup, dan event dengan partner, dan bisa merancang aktivasi sesuai tujuanmu.",
        includes: [
          "Sponsor event dan bootcamp",
          "Menjadi co-host atau sponsor satu sesi kelas online",
          "Aktivasi komunitas di Discord dan di meetup NiFi",
          "Ruang lingkup disepakati di awal: apa yang dijalankan NiFi dan apa yang disiapkan timmu",
        ],
      },
      academy: {
        lead: "NiFi Academy mengadakan kelas online yang dipandu praktisi, dan program inkubasi yang melatih mahasiswa menulis riset ekuitas untuk kompetisi, dengan mentor dari industri keuangan.",
        includes: [
          "Kelas dan webinar yang disusun bersama partner",
          "Sesi pembicara dengan praktisi",
          "Sponsor program inkubasi Academy",
          "Menjadi tuan rumah company visit untuk peserta Academy",
        ],
      },
      arthara: {
        lead: "Arthara adalah platform analisis saham Indonesia dari NiFi. Arthara mengikuti siapa yang membeli, menjual, dan memegang tiap saham di BEI, bersama laporan perusahaan dan kondisi makro.",
        includes: [],
      },
    },
  },

  en: {
    eyebrow: "For Business",
    headline: ["Open for", "collaboration."],
    sub: "NiFi works with brands and organisations that want to reach people who follow finance and investing. We do it through content, events, NiFi Academy and Arthara.",
    discuss: "Discuss a partnership",
    seeServices: "See services",
    mailSubject: "Partnership with Not Into Finance",
    kinds: { Service: "Service", Platform: "Platform" },
    canInclude: "Can include",
    formats: "Placement formats",
    format: "Format",
    addOn: "Add-on",
    examplesNote: "The examples are NiFi's own posts, shown for style. They are not sponsored.",
    program: "Program",
    pastClasses: "Past online classes",
    pastClassesLabel: "Past NiFi online classes",
    classAlt: (title, speaker) => `Poster for the NiFi class "${title}" with ${speaker}`,
    incubationAlt: 'Poster for the NiFi Academy Incubation program "Research to Win"',
    exploreArthara: "Open Arthara",
    agreed: "Format, scope and deliverables are agreed for each collaboration.",
    partnersTitle: "Previous Partnerships",
    partnersBody: "Organisations NiFi has worked with, grouped by type of collaboration.",
    groups: { academy: "NiFi Academy partners", partners: "Business Partners" },
    closingTitle: "Let's work together.",
    closingBody: "Tell us about your brand or organisation and what you have in mind. We'll reply by email.",
    incubation: {
      summary: "A program for Indonesian undergraduates focused on writing equity research papers for competitions, with mentors from the finance industry.",
      steps: ["Open recruitment", "Incubation with mentors", "Company visit", "Graduation"],
    },
    events: [
      { alt: "NiFi community members and guests in a group photo at an event with Doo Financial", caption: "NiFi event with Doo Financial" },
      { alt: "NiFi community members together at a meetup", caption: "NiFi community meetup" },
      { alt: "NiFi volunteers at a #NiFiBerbagi charity activity, faces covered for privacy", caption: "#NiFiBerbagi charity activity" },
    ],
    services: {
      "brand-placement": {
        lead: "We put your brand inside finance content built on research. The NiFi team writes and designs each piece, then publishes it on NiFi's channels.",
        includes: [],
        formats: [
          {
            name: "Instagram + X",
            items: ["1 feed post on Instagram", "1 post on X", "Copy and design by the NiFi team", "Brand mention and tag in the caption"],
            alt: "A NiFi Journal post on Instagram",
            caption: "Example: NiFi Journal post",
          },
          {
            name: "Video on Reels, TikTok & X",
            items: [
              "1 video on Instagram Reels, TikTok and X",
              "1 feed post on Instagram",
              "Scripted, filmed and edited by NiFi",
              "Full content ownership for your brand",
              "Brand mention and tag in the caption",
            ],
            alt: "A short NiFi explainer video",
            caption: "Example: NiFi short video",
          },
        ],
        addOn: "Paid promotion can be added on top of our organic reach.",
      },
      events: {
        lead: "Reach the NiFi community online, in person and on Discord. We run #NiFiBerbagi online classes and charity activities, bootcamps, meetups and events with partners, and we can plan an activation around your goals.",
        includes: [
          "Event and bootcamp sponsorship",
          "Co-hosting or sponsoring an online class session",
          "Community activations on Discord and at NiFi meetups",
          "A scope agreed up front: what NiFi runs and what your team provides",
        ],
      },
      academy: {
        lead: "NiFi Academy runs online classes led by practitioners, and an incubation program that trains students to write equity research for competitions, with mentors from the finance industry.",
        includes: [
          "Classes and webinars built with partners",
          "Speaker sessions with practitioners",
          "Sponsoring the Academy incubation program",
          "Hosting a company visit for Academy participants",
        ],
      },
      arthara: {
        lead: "Arthara is NiFi's stock analysis platform for Indonesian equities. It follows who is buying, selling and holding each IDX stock, alongside company filings and the macro picture.",
        includes: [],
      },
    },
  },
};
