"""Text for WMO 12 October 2026 (pages 1-3 + glossary). Markup: *italic*, **bold**, ***bold-italic***.

v5: every highlight follows What -> Why -> Impact -> punch line; the three highlights on a page read as one story.
"""

DATE = "12 October 2026"

PAGES = {
    1: {
        'title': 'Global: The Freight Premium',
        'box': 'Dalam sepekan terakhir, beban energi lebih banyak datang dari ongkos angkut: tarif tanker minyak naik 20,92% WoW, jauh di atas Brent (+2,42%). Namun, ekspektasi inflasi justru turun seiring sikap The Fed yang masih *hawkish*, sehingga *real yield* bertahan tinggi dan membatasi ruang *rebound* emas.',
        'paras': [
            '***Freight, Not Just Oil.*** Tarif tanker minyak (BIDY) naik 20,92% WoW ke 7.964, atau 4,0 kali level sebelum perang pada 27 Februari 2026 **(Exhibit 1)**, sementara Brent hanya naik 2,42% ke USD 104,72. Pasalnya, penutupan Selat Hormuz mendorong importir Asia beralih ke minyak Atlantik dengan rute lebih jauh, sementara *ship-to-ship transfer* menurunkan efisiensi armada (Reuters). Hal ini mengindikasikan ongkos angkut menjadi premi di atas harga minyak, sehingga biaya energi importir Asia, termasuk Indonesia, lebih tinggi daripada harga Brent selama Selat Hormuz tertutup.',
            '***The Fed Reads the Fuel Gauge.*** Lonjakan biaya energi belum mengubah arah The Fed: *fed funds futures* masih memperkirakan suku bunga naik ke 4,25% pada akhir 2026, tidak berubah WoW, meski peluang kenaikan pada Oktober 2026 turun dari 22,1% ke 19,4%. Pasalnya, FOMC *minutes* (7 Oktober 2026) menilai satu kenaikan lagi kemungkinan tepat sebelum akhir tahun, sehingga ekspektasi bergeser ke Desember 2026. Secara teori, lonjakan biaya energi seharusnya mendorong ekspektasi inflasi. Kontras dengan hal tersebut, *breakeven* 10 tahun justru turun 3 bps ke 2,33% dan *yield* UST 10 tahun turun 4 bps ke 5,24%, sementara DXY naik 0,27% ke 102,21. Hal ini mengindikasikan pasar menilai sikap *hawkish* The Fed cukup meredam inflasi, sehingga *real yield* tertahan di 2,91% **(Exhibit 2).**',
            '***Gold Has a Bid, Not a Floor.*** Secara teori, *real yield* yang tinggi seharusnya menekan emas. Kontras dengan hal tersebut, emas justru naik 1,28% WoW ke USD 4.194,24, berbalik dari pelemahan 3,35% pada minggu sebelumnya. Hal ini mengindikasikan kenaikan emas bukan didorong kebijakan moneter, namun oleh aksi beli di harga rendah (Reuters), didukung penambahan cadangan emas China dan *inflow* ETF emas global sekitar USD 10 miliar pada September 2026. Namun, sejak puncak 28 Januari 2026, emas masih turun 22,58% seiring kenaikan *real yield* 101 bps. Dengan demikian, emas lebih tepat diposisikan sebagai lindung nilai geopolitik, bukan untuk mengejar *rebound*, hingga *real yield* turun.',
        ],
        'ex': ['Exhibit 1: Baltic Dirty Tanker Index (Points)', 'Exhibit 2: Gold (USD/oz) vs. UST 10YR Real Yield (%)'],
        'src': ['Source: Bloomberg (9 October 2026)', 'Source: Bloomberg, U.S. Treasury (9 October 2026)'],
    },
    2: {
        'title': 'US: From Chips to Watts',
        'box': 'SOX turun 4,30% WoW meski data pemasok *chip* mencetak rekor, seiring keraguan pasar terhadap monetisasi AI di sisi pengguna akhir. Pergerakan WoW mengindikasikan dana investor beralih ke listrik, mata rantai AI yang paling langka dan sudah terkontrak.',
        'paras': [
            '***Record Orders, Falling Shares.*** SOX turun 4,30% WoW, berbalik dari kenaikan 3,69% pada minggu sebelumnya, sementara S&P 500 naik 1,15%. Secara teori, data pemasok yang mencetak rekor seharusnya menopang SOX: pada 8 Oktober 2026, TSMC melaporkan penjualan September 2026 naik 54,6% YoY dan Samsung memperkirakan rekor laba operasi Q3-26. Kontras dengan hal tersebut, SOX justru turun 3,39% pada hari yang sama. Pasalnya, Financial Times melaporkan *annualized revenue* OpenAI hampir USD 50 miliar, di bawah sinyal sebelumnya sekitar USD 70 miliar. Hal ini mengindikasikan pasar lebih menimbang kemampuan pengguna akhir memonetisasi AI dibandingkan pesanan pemasok.',
            '***Same Earnings, Lower Multiple.*** Dampaknya paling terasa pada saham yang paling bergantung pada belanja AI: GPU/*logic* dan memori/*storage* turun rata-rata 5,99% dan 6,10% WoW **(Exhibit 3).** Estimasi laba *forward* SOX tidak berubah, sehingga seluruh penurunan berasal dari valuasi: P/E turun dari 30,1x ke 28,8x, kini sedikit di bawah rata-rata 5 tahun (29,2x) namun masih di atas rata-rata 10 tahun (24,7x) **(Exhibit 4).** Reaksi ini terjadi meski, menurut Reuters, selisih tersebut terutama berasal dari perbedaan metode perhitungan. Hal ini mengindikasikan premi valuasi semikonduktor kini bergantung pada bukti monetisasi AI, bukan lagi pertumbuhan pesanan.',
            '***Watts Over Wafers.*** Di saat yang sama, pergerakan WoW mengindikasikan dana investor beralih ke listrik, mata rantai AI yang paling langka dan sudah terkontrak: saham Constellation dan Vistra naik 15,76% dan 15,33% WoW. Salah satu katalisnya datang dari kontrak 20 tahun antara Google dan Constellation untuk 890 MW kapasitas nuklir tambahan (6 Oktober 2026), serta komitmen pinjaman bersyarat Departemen Energi AS hingga USD 4,2 miliar untuk reaktor Vistra. Dengan rotasi tersebut, eksposur AI dengan kontrak dan arus kas yang terlihat menjadi *trade idea* yang lebih menarik. Namun, dengan estimasi laba SOX yang belum turun dan panduan *capex hyperscaler* yang masih naik, koreksi semikonduktor yang murni *derating* juga membuka ruang akumulasi bertahap.',
        ],
        'ex': ['Exhibit 3: AI Value Chain Return, WoW (%)', 'Exhibit 4: SOX 12M Forward P/E vs. 10Y Average (x)'],
        'src': ['Source: Bloomberg (2–9 October 2026); simple average per group',
                'Source: Bloomberg (9 October 2026); bands = 10Y mean ± 1σ/2σ'],
    },
    3: {
        'title': 'Indonesia: Cheap Is Not a Catalyst',
        'box': 'IHSG naik 0,94% WoW seiring jual bersih asing yang mengecil. Namun, kondisi konsumen melemah dan ruang kebijakan fiskal maupun moneter terbatas, sehingga diskon valuasi saham Indonesia belum memiliki pemicu.',
        'paras': [
            '***Today Feels Worse Than Tomorrow.*** Survei BI (8 Oktober 2026) mencatat Indeks Kondisi Ekonomi Saat Ini turun ke 107,5 pada September 2026 dari 109,4, terendah sepanjang 2026. Pasalnya, indeks penghasilan saat ini turun 3,4 poin ke 114,6 dan indeks ketersediaan lapangan kerja turun 3,0 poin ke 101,1. Pelemahan ini sejalan dengan belanja rumah tangga: penjualan eceran September 2026 diperkirakan hanya tumbuh 1,4% YoY, di bawah rata-rata 2025 sebesar 3,1% **(Exhibit 5).** Dengan demikian, optimisme konsumen terhadap enam bulan ke depan (indeks ekspektasi 128,7) belum diterjemahkan menjadi belanja, sehingga proyeksi laba sektor konsumsi belum layak dinaikkan.',
            '***The State Absorbs the Fuel Bill.*** Kenaikan biaya energi tercermin pada APBN: per September 2026, subsidi dan kompensasi energi mencapai Rp376,8 triliun, naik 54,1% YoY, sementara pagu efektif BGN dipangkas ke Rp229,0 triliun dari Rp268,0 triliun, dan penerima MBG turun dari 63,3 juta ke 57,0 juta setelah 1.276 SPPG ditutup, meski belanja MBG September 2026 naik ke Rp19,0 triliun **(Exhibit 5).** Dari sisi moneter, BI menahan BI-Rate di 5,75% pada 23 September 2026 demi stabilitas rupiah; selama The Fed masih diekspektasi naik, ruang pemangkasan BI-Rate terbatas. Dengan demikian, kebijakan fiskal dan moneter lebih berfungsi menjaga stabilitas, bukan mendorong konsumsi.',
            '***Discount Without a Trigger.*** IHSG naik 0,94% WoW ke 6.093,76 setelah turun 3,28% pada minggu sebelumnya, seiring jual bersih asing yang mengecil ke sekitar Rp2,5 triliun dari Rp5,0 triliun. Dengan asing yang masih *net sell*, hal ini mengindikasikan penguatan IHSG lebih ditopang investor domestik. Valuasi pun hampir tidak berubah: *forward* P/E MSCI Indonesia 9,2x, atau −2,36σ dari rata-rata 10 tahun dan 38,89% di bawah MSCI ASEAN, padahal rata-rata 10 tahun keduanya hampir setara **(Exhibit 6).** Dengan diskon tersebut, saham Indonesia seharusnya menarik untuk diakumulasi. Namun, dengan risiko *downgrade* pada *review* MSCI November 2026, konsumsi yang melemah, dan ruang kebijakan yang terbatas, akumulasi lebih tepat dilakukan bertahap hingga asing kembali *net buy*.',
        ],
        'ex': ['Exhibit 5: MBG Monthly Spending (IDR Tn) vs. Retail Sales Growth (% YoY)',
               'Exhibit 6: MSCI Indonesia 12M Forward P/E vs. 10Y Average (x)'],
        'src': ['Source: Kemenkeu, Bank Indonesia (9 October 2026); *forecast',
                'Source: Bloomberg (9 October 2026); bands = 10Y mean ± 1σ/2σ'],
    },
}

GLOSSARY = [
    "*Annualized revenue*: pendapatan periode pendek yang disetahunkan, bukan realisasi setahun.",
    "BIDY: Baltic Dirty Tanker Index, indeks tarif angkut kapal tanker minyak mentah.",
    "*Breakeven*: selisih *yield* UST nominal dan *real yield*; proksi ekspektasi inflasi pasar.",
    "CDS: biaya proteksi gagal bayar; makin tinggi, makin besar persepsi risiko kredit.",
    "*Derating*: turunnya valuasi (P/E) saat estimasi laba tidak turun.",
    "*Fed funds futures*: kontrak yang mencerminkan ekspektasi suku bunga The Fed per rapat.",
    "*Forward* P/E: harga dibagi estimasi laba 12 bulan ke depan.",
    "*Hawkish*: sikap bank sentral yang condong menaikkan suku bunga untuk meredam inflasi.",
    "*Hyperscaler*: penyedia *cloud* skala besar (Microsoft, Amazon, Alphabet, Meta, Oracle).",
    "MBG/SPPG: Makan Bergizi Gratis dan dapur penyedianya (Satuan Pelayanan Pemenuhan Gizi).",
    "*Real yield*: *yield* obligasi setelah memperhitungkan inflasi, diukur dari UST TIPS.",
    "*Ship-to-ship transfer*: pemindahan muatan minyak antarkapal di tengah laut.",
    "SOX: Philadelphia Semiconductor Index, indeks saham semikonduktor AS.",
    "*Target range*: kisaran suku bunga The Fed, kini 3,75–4,00%; WMO mengutip batas atasnya.",
    "*Z-score* (σ): jarak suatu nilai dari rata-ratanya, dalam satuan standar deviasi.",
]
