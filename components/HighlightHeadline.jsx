// Hero headline: the lead words fade in from a blur one after another, then
// the highlighted phrase arrives with a looping colourful marker and slowly
// panning gradient text. Styles live in globals.css (.reveal, .hl, .hl-text).
export default function HighlightHeadline({ lead, highlight, className = "" }) {
  const words = lead.split(" ");

  return (
    <h1 className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="reveal" style={{ animationDelay: `${i * 80}ms` }}>
            {word}
          </span>{" "}
        </span>
      ))}
      <span className="hl">
        <span className="hl-text">{highlight}</span>
      </span>
    </h1>
  );
}
