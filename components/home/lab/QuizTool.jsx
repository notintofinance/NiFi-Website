"use client";

import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { useLang } from "@/components/Lang";
import { getJargon } from "@/data/home-data";

// "Tebak istilah": read a plain-language meaning, pick the term. Questions
// come from the same glossary as the hero cards, shuffled on each start.

const ROUNDS = 5;
const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const makeQuestions = (jargon) =>
  shuffle(jargon)
    .slice(0, ROUNDS)
    .map((q) => ({
      meaning: q.meaning,
      answer: q.term,
      options: shuffle([q.term, ...shuffle(jargon.filter((j) => j.term !== q.term)).slice(0, 2).map((j) => j.term)]),
    }));

export default function QuizTool() {
  const { lang, t } = useLang();
  const L = t.lab;
  const [questions, setQuestions] = useState(null);
  const [quizLang, setQuizLang] = useState(lang);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  const start = () => {
    setQuestions(makeQuestions(getJargon(lang)));
    setQuizLang(lang);
    setStep(0);
    setPicked(null);
    setScore(0);
  };

  // A quiz in progress is in one language; switching language restarts it.
  if (!questions || quizLang !== lang) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-start justify-center rounded-2xl border border-dashed border-white/15 p-6">
          <p className="font-display text-5xl font-extrabold tracking-tight text-white">
            {L.quizCount(ROUNDS)[0]}
            <span className="text-slate-500">{L.quizCount(ROUNDS)[1]}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {L.quizIntro}
          </p>
        </div>
        <button type="button" onClick={start} className="btn-primary mt-6 w-full">
          {L.quizStart}
        </button>
      </div>
    );
  }

  if (step >= questions.length) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center" role="status">
          <p className="micro">{L.quizScore}</p>
          <p className="mt-2 font-display text-6xl font-extrabold tracking-tight text-white">
            {score}
            <span className="text-slate-500">/{questions.length}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {score === questions.length
              ? L.quizPerfect
              : score >= 3
              ? L.quizGood
              : L.quizLow}
          </p>
        </div>
        <button type="button" onClick={start} className="btn-secondary mt-6 w-full">
          <RotateCcw size={15} aria-hidden="true" />
          {L.quizAgain}
        </button>
      </div>
    );
  }

  const q = questions[step];
  const answered = picked != null;
  const pick = (option) => {
    if (answered) return;
    setPicked(option);
    if (option === q.answer) setScore((s) => s + 1);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {questions.map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-cool" : "bg-white/10"}`} />
        ))}
      </div>
      <p className="micro mt-4">
        {L.quizStep(step + 1, questions.length)}
      </p>
      <p className="mt-2 font-display text-lg font-bold leading-snug tracking-tight text-white">
        {q.meaning}
      </p>

      <div role="group" aria-label={L.quizOptions} className="mt-5 flex flex-col gap-2">
        {q.options.map((option) => {
          const isAnswer = option === q.answer;
          const isPicked = option === picked;
          const state = !answered
            ? "border-white/15 text-white hover:border-white/50"
            : isAnswer
            ? "border-emerald-400/70 bg-emerald-400/10 text-white"
            : isPicked
            ? "border-rose-400/70 bg-rose-400/10 text-white"
            : "border-white/10 text-slate-400";
          return (
            <button
              key={option}
              type="button"
              onClick={() => pick(option)}
              aria-disabled={answered}
              className={`flex min-h-[48px] items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm font-semibold transition-colors ${state}`}
            >
              {option}
              {answered && isAnswer && <Check size={16} className="text-emerald-300" aria-hidden="true" />}
              {answered && isPicked && !isAnswer && <X size={16} className="text-rose-300" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
        <p aria-live="polite" className="text-sm text-slate-300">
          {answered && (picked === q.answer ? L.quizRight : L.quizWrong(q.answer))}
        </p>
        {answered && (
          <button
            type="button"
            onClick={() => {
              setStep((s) => s + 1);
              setPicked(null);
            }}
            className="chip flex-none !border-white !bg-white !text-ink-950"
          >
            {step + 1 === questions.length ? L.quizFinish : L.quizNext}
          </button>
        )}
      </div>
    </div>
  );
}
