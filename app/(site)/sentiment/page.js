import { Activity, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SentimentReading from "@/components/SentimentReading";
import snapshot from "@/data/sentiment-snapshot.json";

export const metadata = {
  title: "Market Sentiment | Not Into Finance (NiFi)",
  description:
    "A plain-language read on market sentiment, from our Market Intelligence & Sentiment Engine reading published market data.",
};

const chipTone = {
  positive: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  negative: "text-red-400 border-red-400/30 bg-red-400/10",
  neutral: "text-slate-300 border-navy-600 bg-navy-800/60",
};

function NewsRow({ item }) {
  return (
    <div className="rounded-2xl border border-navy-600/60 bg-navy-700/40 p-5">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {item.topic && (
          <span className="rounded-md bg-navy-800/60 px-2 py-0.5 font-medium text-slate-300">
            {item.topic}
          </span>
        )}
        <span>{item.when}</span>
      </div>
      <h4 className="mt-2 text-base font-semibold leading-snug text-white">
        {item.title}
      </h4>
      {item.chips && item.chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.chips.map((c, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${
                chipTone[c.direction] || chipTone.neutral
              }`}
            >
              {c.arrow} {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SentimentPage() {
  const markets = snapshot.markets || [];
  const news = [...(snapshot.bad_news || []), ...(snapshot.good_news || [])].slice(
    0,
    6
  );

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
              <Activity size={14} />
              Market Sentiment
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              How the market is feeling, right now
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              A plain-language read on market sentiment, from our Market
              Intelligence &amp; Sentiment Engine as it reads published market
              data. Snapshot updated {snapshot.updated}
              {snapshot.sources_total
                ? ` · ${snapshot.sources_working}/${snapshot.sources_total} sources live`
                : ""}
              .
            </p>
          </div>
        </section>

        {/* Market readings */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {markets.map((m) => (
              <div
                key={m.code}
                className="flex flex-col gap-6 rounded-2xl border border-navy-600/60 bg-navy-700/40 p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{m.name}</h2>
                  {m.trend && (
                    <span className="text-xs text-slate-500">{m.trend}</span>
                  )}
                </div>
                <SentimentReading label="From the news flow" reading={m.media} />
                <SentimentReading
                  label="From key events (model)"
                  reading={{
                    word: m.word,
                    bin: m.bin,
                    score: m.score,
                    counted: m.counted,
                  }}
                />
              </div>
            ))}
          </div>

          {/* How to read it */}
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-navy-600/60 bg-navy-800/40 p-5 text-sm leading-relaxed text-slate-400">
            <Info size={18} className="mt-0.5 shrink-0 text-accent-bright" />
            <p>
              The scale runs from &minus;100 (very bearish) to +100 (very
              bullish), with 0 neutral. &ldquo;From the news flow&rdquo; reads the
              tone across many news items; &ldquo;from key events&rdquo; is our
              model&apos;s read on a smaller set of classified market events, so
              it can swing on only a few data points. This is a point-in-time
              snapshot for education, not investment advice.
            </p>
          </div>
        </section>

        {/* Notable news */}
        {news.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 pb-20">
            <h2 className="mb-6 text-2xl font-bold text-white">
              What&apos;s moving the mood
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsRow key={item.event_id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
