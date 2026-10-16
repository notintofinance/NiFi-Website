// A single sentiment reading: a plain-language word, a -100..+100 score,
// and a bar showing where it sits on the bearish <-> bullish scale.

const toneColor = {
  p3: "text-emerald-400",
  p2: "text-emerald-400",
  p1: "text-emerald-300",
  z: "text-slate-300",
  n1: "text-amber-400",
  n2: "text-red-400",
  n3: "text-red-400",
  na: "text-slate-500",
};

const barColor = {
  p3: "bg-emerald-400",
  p2: "bg-emerald-400",
  p1: "bg-emerald-300",
  z: "bg-slate-400",
  n1: "bg-amber-400",
  n2: "bg-red-400",
  n3: "bg-red-400",
  na: "bg-slate-600",
};

export default function SentimentReading({ label, reading }) {
  const { word, bin = "na", score, counted = 0 } = reading || {};
  const hasScore = typeof score === "number";
  // Map -100..100 to 0..100% for the marker position.
  const pos = hasScore ? (score + 100) / 2 : 50;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className="text-xs text-slate-500">
          {counted > 0
            ? `${counted.toLocaleString()} ${counted === 1 ? "item" : "items"}`
            : "no data"}
        </span>
      </div>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span className={`text-lg font-semibold ${toneColor[bin] || "text-slate-300"}`}>
          {word}
        </span>
        {hasScore && (
          <span className="text-sm font-medium text-slate-500">
            {score > 0 ? `+${score}` : score}
          </span>
        )}
      </div>

      {/* Scale: bearish (left) <-> bullish (right), 0 in the middle */}
      <div className="relative mt-2 h-1.5 w-full rounded-full bg-navy-600">
        <span className="absolute left-1/2 top-1/2 h-2.5 w-px -translate-y-1/2 bg-navy-500" />
        {hasScore && (
          <span
            className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-navy-800 ${
              barColor[bin] || "bg-slate-500"
            }`}
            style={{ left: `${pos}%` }}
          />
        )}
      </div>
    </div>
  );
}
