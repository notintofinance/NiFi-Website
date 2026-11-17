"use client";

// A surface with a soft light that follows the pointer (see .spot in
// globals.css). Purely decorative; it does nothing on touch devices.
export default function Spot({ as: Tag = "div", className = "", children, ...rest }) {
  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag className={`spot ${className}`} onPointerMove={onPointerMove} {...rest}>
      {children}
    </Tag>
  );
}
