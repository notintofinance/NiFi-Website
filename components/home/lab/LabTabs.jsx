"use client";

import { useRef, useState } from "react";
import { useLang } from "@/components/Lang";
import Spot from "@/components/Spot";
import CompoundTool from "./CompoundTool";
import InflationTool from "./InflationTool";
import Rule72Tool from "./Rule72Tool";
import DiversifyTool from "./DiversifyTool";
import QuizTool from "./QuizTool";

// The Lab: five small tools, one open at a time. Tabs along the top choose
// the tool (arrow keys move between them); the panel shows the question it
// answers on the left and the tool on the right.
const TOOLS = [
  { key: "compound", Tool: CompoundTool, wide: true },
  { key: "inflation", Tool: InflationTool },
  { key: "rule72", Tool: Rule72Tool },
  { key: "diversify", Tool: DiversifyTool },
  { key: "quiz", Tool: QuizTool },
];

export default function LabTabs() {
  const { t } = useLang();
  const [index, setIndex] = useState(0);
  const tabs = useRef([]);
  const { key, Tool, wide } = TOOLS[index];
  const tool = t.lab.tools[key];

  const go = (i) => {
    setIndex(i);
    tabs.current[i]?.focus();
  };
  const onKeyDown = (e) => {
    const n = TOOLS.length;
    if (e.key === "ArrowRight") go((index + 1) % n);
    else if (e.key === "ArrowLeft") go((index - 1 + n) % n);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(n - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div>
      <div className="win">
        <div
          role="tablist"
          aria-label={t.lab.tablist}
          onKeyDown={onKeyDown}
          className="scroll-quiet flex overflow-x-auto border-b border-white/[0.08]"
        >
          {TOOLS.map((item, i) => {
            const selected = i === index;
            return (
              <button
                key={item.key}
                ref={(el) => (tabs.current[i] = el)}
                type="button"
                role="tab"
                id={`lab-tab-${item.key}`}
                aria-selected={selected}
                aria-controls="lab-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setIndex(i)}
                className={`relative flex min-h-[56px] flex-none items-center gap-2.5 whitespace-nowrap border-r border-white/[0.08] px-5 text-sm font-semibold transition-colors focus-visible:-outline-offset-2 lg:flex-1 lg:justify-center ${
                  selected ? "bg-white/[0.05] text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className={`font-mono text-[11px] ${selected ? "text-cool" : "text-slate-500"}`}>
                  0{i + 1}
                </span>
                {t.lab.tools[item.key].name}
                {selected && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-cool" />}
              </button>
            );
          })}
        </div>

        <Spot
          id="lab-panel"
          role="tabpanel"
          aria-labelledby={`lab-tab-${key}`}
          className={`grid gap-8 p-6 sm:p-10 lg:gap-12 ${wide ? "" : "lg:grid-cols-[0.8fr_1.2fr]"}`}
        >
          <div key={`${key}-head`} className="pop">
            <p className="micro">Lab 0{index + 1}</p>
            <h3 className="mt-3 text-3xl leading-tight sm:text-4xl">{tool.name}</h3>
            <p className="mt-3 max-w-md text-lg leading-relaxed text-slate-300">{tool.question}</p>
          </div>
          <div key={key} className={`pop flex min-h-[340px] flex-col ${wide ? "" : "w-full max-w-md lg:justify-self-end"}`}>
            <Tool />
          </div>
        </Spot>
      </div>

      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-slate-400">
        <strong className="font-semibold text-slate-200">{t.lab.disclaimer[0]}</strong>
        {t.lab.disclaimer[1]}
      </p>
    </div>
  );
}
