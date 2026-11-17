// Number and date formatting written by hand so the server and every
// browser produce exactly the same text (Intl output differs between
// engines, which breaks hydration).

const group = (n, sep) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);

export const rupiah = (n, lang) => `Rp${group(n, lang === "en" ? "," : ".")}`;

// Whole number with thousands separators: 6.394 (id) or 6,394 (en).
export const number = (n, lang) => group(n, lang === "en" ? "," : ".");

// Signed change with one decimal: +28,0% (id) or +28.0% (en).
export const signedPercent = (v, lang) => {
  const s = Math.abs(v).toFixed(1);
  return `${v < 0 ? "-" : "+"}${lang === "en" ? s : s.replace(".", ",")}%`;
};

// One decimal at most: 10,3 (id) or 10.3 (en).
export const decimal = (n, lang) => {
  const v = Math.round(n * 10) / 10;
  const s = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return lang === "en" ? s : s.replace(".", ",");
};

const MONTHS = {
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

// "2026-06-16" → "16 Jun 2026"
export const shortDate = (iso, lang) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${(MONTHS[lang] ?? MONTHS.id)[m - 1]} ${y}`;
};

// "Oct 2026" (as stored in business-data.js) → "Okt 2026" for Indonesian.
export const monthYear = (text, lang) => {
  if (lang === "en") return text;
  const i = MONTHS.en.indexOf(text.slice(0, 3));
  return i < 0 ? text : `${MONTHS.id[i]}${text.slice(3)}`;
};
