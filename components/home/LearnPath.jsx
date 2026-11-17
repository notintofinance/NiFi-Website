"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/components/Lang";
import { getPrimers, primerIds } from "@/data/home-data";

// Beginner path as a small reading app: five steps on the left (a row on
// small screens), the chosen primer on the right. "Tandai selesai" is
// remembered on this device (localStorage), so the progress reflects the
// visitor's own reading. No account, no backend.

const KEY = "nifi-primers-done";
const minutes = (body) => Math.max(1, Math.round(body.join(" ").split(/\s+/).length / 180));

export default function LearnPath() {
  const { lang, t } = useLang();
  const L = t.learn;
  const primers = getPrimers(lang);
  const [current, setCurrent] = useState(primerIds[0]);
  const [done, setDone] = useState([]);
  const reader = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) setDone(saved.filter((id) => primerIds.includes(id)));
    } catch {}
    // The site search can ask for a specific primer: with an event when this
    // page is already open, or with a link such as /learn#primer-risk.
    const open = (id) => primerIds.includes(id) && setCurrent(id);
    const onPick = (e) => open(e.detail);
    const onHash = () => open(window.location.hash.replace("#primer-", ""));
    onHash();
    window.addEventListener("nifi:primer", onPick);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("nifi:primer", onPick);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  const save = (next) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    return next;
  };
  const toggleDone = (id) =>
    setDone((d) => save(d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  const index = primers.findIndex((p) => p.id === current);
  const primer = primers[index];
  const next = primers[index + 1];
  const isDone = done.includes(primer.id);
  const pct = Math.round((done.length / primers.length) * 100);

  const goNext = () => {
    setDone((d) => (d.includes(primer.id) ? d : save([...d, primer.id])));
    if (next) {
      setCurrent(next.id);
      reader.current?.focus();
    }
  };

  return (
    <div className="win">
      <div className="win-bar">
        <span className="win-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="micro">{L.window}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="micro normal-case tracking-normal">
            {L.done(done.length, primers.length)}
          </span>
          <span
            role="progressbar"
            aria-label={L.progress}
            aria-valuemin={0}
            aria-valuemax={primers.length}
            aria-valuenow={done.length}
            className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-white/10 sm:block"
          >
            <span
              className="block h-full rounded-full bg-cool transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </span>
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
        <nav aria-label={L.list} className="border-b border-white/[0.08] lg:border-b-0 lg:border-r">
          <ol className="scroll-quiet flex gap-2 overflow-x-auto p-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:p-4">
            {primers.map((p, i) => {
              const active = p.id === current;
              const finished = done.includes(p.id);
              return (
                <li key={p.id} className="flex-none lg:flex-auto">
                  <button
                    type="button"
                    aria-current={active ? "step" : undefined}
                    onClick={() => setCurrent(p.id)}
                    className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 text-left transition-colors ${
                      active ? "bg-white/[0.07] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border font-mono text-xs ${
                        finished
                          ? "border-cool bg-cool text-ink-950"
                          : active
                          ? "border-white/60 text-white"
                          : "border-white/20"
                      }`}
                    >
                      {finished ? <Check size={15} aria-hidden="true" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap font-display text-sm font-bold tracking-tight">
                        {p.title}
                        {finished && <span className="sr-only">{L.finished}</span>}
                      </span>
                      <span className="hidden font-mono text-[11px] text-slate-400 lg:block">
                        {L.read(minutes(p.body))}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="hidden px-7 pb-5 text-xs leading-relaxed text-slate-400 lg:block">
            {L.saved}
          </p>
        </nav>

        <article
          ref={reader}
          tabIndex={-1}
          aria-labelledby="primer-title"
          className="p-6 focus:outline-none sm:p-9"
        >
          <div key={primer.id} className="pop">
            <p className="micro">
              {L.step(index + 1, primers.length, minutes(primer.body))}
            </p>
            <h3 id="primer-title" className="mt-3 text-3xl leading-tight sm:text-4xl">
              {primer.title}
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-slate-300">{primer.summary}</p>
            <div className="mt-6 max-w-2xl space-y-4 text-[15px] leading-relaxed text-slate-300">
              {primer.body.map((para, k) => (
                <p key={k}>{para}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {next ? (
                <button type="button" onClick={goNext} className="btn-primary">
                  {L.next(next.title)}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                !isDone && (
                  <button type="button" onClick={goNext} className="btn-primary">
                    <Check size={16} aria-hidden="true" />
                    {L.markPath}
                  </button>
                )
              )}
              <button
                type="button"
                aria-pressed={isDone}
                onClick={() => toggleDone(primer.id)}
                className={`btn-secondary ${isDone ? "!border-cool/60 !bg-cool/10" : ""}`}
              >
                <Check size={15} aria-hidden="true" />
                {isDone ? L.marked : L.mark}
              </button>
            </div>
            {!next && done.length === primers.length && (
              <p role="status" className="mt-6 text-sm text-slate-300">
                {L.allDone}
              </p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
