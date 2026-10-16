"""'Why' additions on top of the user's 13:03 edits (slides 1-3 Key Highlights).

Keys are (slide, paragraph index in the Key Highlights box). Only these paragraphs change;
everything else in the deck is left exactly as the user saved it.
"""

NEW = {
    # ---------------- Page 1 ----------------
    (1, 1): (
        "***Moved, Not Removed.*** Dalam seminggu sampai 2 Oktober, peluang suku bunga The Fed ada di 4,00% atau lebih "
        "pada Oktober turun drastis dari 64,2% ke 22,1%. Pemicunya datang dari The Fed sendiri: pada 29 September, "
        "Presiden NY Fed John Williams bilang tidak perlu buru-buru, dan hari itu peluangnya turun dari "
        "70,9% ke 50,9%. NFP September yang hanya +29 ribu (konsensus +90 ribu) ikut memperkuat sinyal itu. Tapi Williams juga "
        "bilang satu kenaikan lagi mungkin tepat di akhir tahun. Data CME FedWatch per 5 Oktober menunjukkan "
        "suku bunga yang diperkirakan *market* masih naik bertahap, dari 3,93% di pertemuan Oktober ke 4,12% di "
        "Desember, lalu 4,68% di akhir 2027, dan peluang 4,00% atau lebih di Desember masih 81,7% **(Exhibit 1).** "
        "Jadi, kenaikannya hanya di-*delay*, bukan dibatalkan."
    ),
    (1, 2): (
        "***The Premium Did the Lifting.*** Jika The Fed sudah terlihat mulai lebih konservatif dalam menaikkan suku bunga, "
        "*yield* obligasi jangka panjang akan ikut turun. Tapi kali ini kebalikannya. Di periode yang sama, UST 10YR justru "
        "naik 11,0 bps ke 5,27%. Penyebabnya ada di *term premium*, yaitu “bayaran tambahan” yang diminta investor karena "
        "uangnya dipinjamkan lebih lama. *Term premium* 10YR (model ACM) naik 14,2 bps ke 0,91%, menuju "
        "*all time high* dalam setahun terakhir, bahkan kenaikannya lebih besar dari kenaikan *yield* itu sendiri "
        "**(Exhibit 2).** Sebagian besar kenaikannya (9,5 bps) terjadi pada 29 dan 30 September, saat Williams memberi sinyal tidak "
        "buru-buru dan PCE Agustus menunjukkan inflasi AS masih 3,4%. Investor tampaknya khawatir The Fed terlalu sabar "
        "menghadapi inflasi."
    ),
    (1, 3): (
        "***Two Ends, Two Stories.*** Efeknya kelihatan jelas di obligasi AS. *Yield* tenor 2 tahun, yang paling "
        "sensitif terhadap The Fed, turun 2,7 bps, sementara tenor 10 tahun naik. Selisih keduanya (*2s10s*) pun melebar "
        "dari 30,9 bps ke 44,6 bps dalam seminggu. Peminjam jangka pendek sedikit lega, tapi bagi pemerintah dan "
        "perusahaan yang butuh dana jangka panjang, biayanya malah makin mahal. Kini biaya pinjaman tidak lagi hanya "
        "ditentukan The Fed, tapi juga “bayaran tambahan” yang diminta investor."
    ),
    # ---------------- Page 2 ----------------
    (2, 1): (
        "***Follow the Money.*** Di tengah maraknya *AI boom*, yang paling menikmati hasilnya justru para penjual “sekop”, "
        "yaitu produsen *chip*. Per 2 Oktober, SOX (indeks saham semikonduktor AS) naik 85,5% YTD, jauh di atas rata-rata "
        "lima *hyperscalers* yang hanya naik 1,5%, dan Oracle malah turun 27,0% **(Exhibit 3).** Contoh terbarunya Micron, "
        "EPS kuartalnya mencapai USD 33,36, padahal setahun sebelumnya hanya di angka USD 2,86. Perkiraan *earnings* dari "
        "analis pun direvisi naik 8,5% dalam beberapa hari, dan SOX yang sempat *lagging* di Q3 kembali naik 3,7% dalam "
        "seminggu. *Market* jelas lebih suka perusahaan yang sudah benar-benar menghasilkan *earnings* dari AI."
    ),
    (2, 3): (
        "***Lenders Read the Balance Sheet.*** Pemberi pinjaman tidak ikut terbawa *euphoria* dari *AI boom*. Yang "
        "mereka lihat adalah kondisi keuangan tiap perusahaan. *Yield* obligasi USD yang jatuh tempo 2036 ada di "
        "kisaran 5,6% untuk Microsoft (*rating* AAA) sampai 7,5% untuk Oracle (*rating* BBB-), selisihnya sekitar 190 bps. "
        "Alasannya ada di arus kas: di kuartal yang berakhir Agustus, *free cash flow* Oracle minus USD 5,40 miliar "
        "karena *capex* melebihi arus kas operasinya. Pasar saham juga "
        "menunjukkan hal yang serupa. Sejak akhir Juni, saham Microsoft dan Meta naik 38,7% dan 29,3%, sementara Oracle "
        "turun 2,9% dan jadi satu-satunya *hyperscaler* yang turun *year to date*. Jadi, yang terkena *punishment* oleh "
        "*market* bukan yang belanja untuk AI, tapi yang belanja AI dengan keuangan yang lebih lemah."
    ),
    # ---------------- Page 3 ----------------
    (3, 1): (
        "***Calm, Not Cheap.*** Rupiah bergerak *ranging* di USD/IDR 17.513–17.975 sepanjang September dan ditutup di "
        "17.875 per 2 Oktober, lebih baik dari *all time high*-nya di 18.178 pada Juni. Salah satu penopangnya adalah dana "
        "asing: kepemilikan asing di SBN naik dari Rp 885,65 triliun di akhir Juni ke Rp 917,71 triliun per 4 September, "
        "tertinggi dalam setahun. Tapi di balik itu semua, cadangan devisa Indonesia turun USD 9,96 miliar dari akhir 2025 "
        "ke USD 146,51 miliar per Agustus, dan sempat USD 144,90 miliar di bulan Mei, yang menurut BI karena pembayaran "
        "utang luar negeri pemerintah dan stabilisasi rupiah. Rupiah sendiri masih melemah 7,1% YTD **(Exhibit 5).** Dengan cadangan devisa yang semakin menipis, ruang untuk "
        "menahan *volatility* berikutnya juga semakin berat."
    ),
    (3, 2): (
        "***One Good Month.*** Kabar baiknya datang dari *trade balance* Indonesia. *Trade surplus* Agustus naik ke USD 3,55 "
        "miliar dari hanya USD 0,12 miliar di Juli, tertinggi sejak September 2025, setelah sempat defisit di "
        "Mei dan Juni **(Exhibit 6).** Pemicunya impor yang turun USD 3,03 miliar dari Juli, sementara ekspor "
        "hanya naik USD 0,39 miliar. Tapi satu bulan memiliki performa yang baik belum bisa mengubah gambaran besarnya. "
        "Total surplus 12 bulan terakhir hanya USD 19,05 miliar, kurang dari separuh 12 bulan sebelumnya (USD 41,67 "
        "miliar), dan surplus Januari sampai Agustus 2026 turun 75,3% ke USD 7,25 miliar karena impor tumbuh 19,84% YoY, "
        "jauh di atas ekspor (4,74%). Surplus ini dapat membantu rupiah untuk sementara, "
        "tapi belum berarti *current account* membaik secara menyeluruh."
    ),
    (3, 3): (
        "***Less Pay, Less Room.*** Masalahnya, “bonus” memegang SBN makin tipis. Selisih *yield* "
        "SBN dan obligasi AS tenor 10 tahun turun dari 298 bps pada 11 Juni ke 190 bps per 2 Oktober, karena *yield* "
        "obligasi AS naik 81 bps sementara *yield* SBN turun 27,9 bps. Padahal, risiko pelemahan rupiah masih belum mereda. "
        "Inflasi September juga naik ke 3,28% dari 2,88% di Juli, mendekati "
        "batas atas target BI di 3,5%, sehingga *real yield* SBN bersisa sekitar 3,9%. Tidak heran BI menahan "
        "BI-Rate di 5,75% pada 23 September demi menjaga rupiah, dan Indonesia perlu menawarkan *yield* "
        "lebih tinggi agar dana asing bertahan."
    ),
}

# The hook each paragraph must still start with in the user's file (guards against editing the wrong paragraph).
HOOK = {k: v.split("***")[1] for k, v in NEW.items()}
