"use client";

import { useId } from "react";

// Shared slider for the Lab tools.
export function Slider({ label, value, display, min, max, step, onChange }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-base font-bold text-white">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-2 w-full"
      />
    </div>
  );
}

// The highlighted figure inside a sentence.
export function Figure({ children }) {
  return <strong className="font-display text-xl font-bold text-white">{children}</strong>;
}
