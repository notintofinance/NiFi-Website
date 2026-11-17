"use client";

// The hero's real-time 3D scene (React Three Fiber).
//
// Nine dark acrylic cards float in a loose scatter, each carrying a finance
// term. Pointing at (or tapping) a card flips it to a coloured face with the
// plain-language meaning. Scrolling tidies the scatter into a neat grid:
// "what looks complicated, sorted out".
//
// Kept deliberately light: one shared geometry, canvas-drawn label textures,
// no shadows, no post-processing. The parent pauses the render loop when the
// hero is off screen and swaps in a 2D poster when WebGL or motion is off.

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import tokens from "@/design-tokens";

const CARD_W = 1.9;
const CARD_H = 1.2;
const DEPTH = 0.07;
const BEVEL = 0.015;
const FACE_Z = DEPTH / 2 + BEVEL + 0.006;
const GAP_X = 0.24;
const GAP_Y = 0.22;

// Loose starting arrangement (position, rotation) for each card.
const SCATTER = [
  { p: [-2.7, 1.75, -1.2], r: [0.28, 0.5, -0.22] },
  { p: [0.15, 2.05, 0.7], r: [-0.3, -0.25, 0.12] },
  { p: [2.6, 1.3, -0.7], r: [0.2, -0.55, 0.26] },
  { p: [-1.7, 0.1, 1.1], r: [-0.18, 0.35, 0.1] },
  { p: [1.0, 0.25, -1.7], r: [0.34, 0.2, -0.3] },
  { p: [2.9, -0.55, 0.9], r: [-0.26, -0.4, -0.12] },
  { p: [-2.8, -1.45, -0.5], r: [0.22, 0.6, 0.24] },
  { p: [-0.25, -1.75, 1.0], r: [-0.32, -0.15, -0.2] },
  { p: [2.05, -1.95, -1.1], r: [0.3, -0.5, 0.16] },
];

// Portrait screens show six cards in a looser two-column stagger so every
// term stays readable.
const SCATTER_PORTRAIT = [
  { p: [-0.72, 2.0, -0.6], r: [0.2, 0.34, -0.14] },
  { p: [0.78, 1.5, 0.5], r: [-0.22, -0.3, 0.1] },
  { p: [-0.9, 0.52, 0.7], r: [-0.14, 0.26, 0.09] },
  { p: [0.72, 0.02, -0.8], r: [0.24, -0.22, -0.12] },
  { p: [-0.62, -1.0, -0.3], r: [0.16, 0.3, 0.13] },
  { p: [0.82, -1.62, 0.6], r: [-0.2, -0.26, -0.1] },
];

const lerp = THREE.MathUtils.lerp;
const damp = THREE.MathUtils.damp;

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Card faces are drawn on a 2D canvas and used as textures, so the scene
// needs no font files or text-rendering library of its own.
function drawFace({ side, term, meaning, label, color, font }) {
  const W = 760;
  const H = 480;
  const pad = 58;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "alphabetic";

  if (side === "front") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pad + 9, 86, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `600 25px ${font}`;
    ctx.fillStyle = "rgba(226,232,240,0.72)";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
    ctx.fillText(label.toUpperCase(), pad + 34, 95);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "-2px";

    let size = 104;
    do {
      ctx.font = `800 ${size}px ${font}`;
      size -= 4;
    } while (ctx.measureText(term).width > W - pad * 2 && size > 48);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(term, pad, H - 104);
    // Colour accent under the term
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(pad, H - 70, 120, 12, 6);
    ctx.fill();
  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 46);
    ctx.fill();

    ctx.fillStyle = "rgba(8,9,11,0.7)";
    ctx.font = `700 25px ${font}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
    ctx.fillText(term.toUpperCase(), pad, 95);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "-1px";

    ctx.fillStyle = "#08090B";
    let size = 54;
    let lines = [];
    do {
      ctx.font = `700 ${size}px ${font}`;
      lines = wrapLines(ctx, meaning, W - pad * 2);
      size -= 3;
    } while (lines.length * (size + 3) * 1.22 > H - 190 && size > 30);
    const lh = (size + 3) * 1.22;
    lines.forEach((l, i) => ctx.fillText(l, pad, 190 + i * lh));
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Soft studio reflections for the acrylic, generated once on the GPU.
function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Card({ index, item, label, geometry, font, layout, order, flipped, handlers }) {
  const group = useRef();
  const color = tokens.play[item.hue];

  const faces = useMemo(
    () => ({
      front: drawFace({ side: "front", term: item.term, label, color, font }),
      back: drawFace({ side: "back", term: item.term, meaning: item.meaning, color, font }),
    }),
    [item, label, color, font]
  );
  useEffect(
    () => () => {
      faces.front.dispose();
      faces.back.dispose();
    },
    [faces]
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const o = order.current;
    const s = layout.scatter[index];
    const t = layout.grid[index];
    const time = state.clock.elapsedTime;
    const drift = 1 - o * 0.85;

    const tx = lerp(s.p[0] * layout.spreadX, t[0], o) + Math.sin(time * 0.6 + index) * 0.06 * drift;
    const ty = lerp(s.p[1] * layout.spreadY, t[1], o) + Math.cos(time * 0.5 + index * 1.7) * 0.09 * drift;
    const tz = lerp(s.p[2], 0, o) + (flipped ? 0.7 : 0);
    g.position.x = damp(g.position.x, tx, 4, dt);
    g.position.y = damp(g.position.y, ty, 4, dt);
    g.position.z = damp(g.position.z, tz, 4, dt);

    const rx = lerp(s.r[0], 0, o) + Math.sin(time * 0.4 + index) * 0.05 * drift;
    const ry = lerp(s.r[1], 0, o) + (flipped ? Math.PI : 0);
    const rz = lerp(s.r[2], 0, o);
    g.rotation.x = damp(g.rotation.x, flipped ? 0 : rx, 5, dt);
    g.rotation.y = damp(g.rotation.y, ry, 5, dt);
    g.rotation.z = damp(g.rotation.z, flipped ? 0 : rz, 5, dt);

    const sc = damp(g.scale.x, flipped ? 1.14 : 1, 6, dt);
    g.scale.setScalar(sc);
  });

  const s = layout.scatter[index];
  return (
    <group
      ref={group}
      position={[s.p[0] * layout.spreadX, s.p[1] * layout.spreadY, s.p[2]]}
      rotation={s.r}
    >
      <mesh
        geometry={geometry}
        onPointerDown={(e) => handlers.down(e, index)}
        onPointerOver={(e) => handlers.over(e, index)}
        onPointerOut={(e) => handlers.out(e, index)}
        onClick={(e) => handlers.click(e, index)}
      >
        <meshPhysicalMaterial
          color="#131a27"
          roughness={0.16}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.12}
          transparent
          opacity={0.92}
          envMapIntensity={1.15}
        />
      </mesh>
      <mesh position={[0, 0, FACE_Z]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={faces.front} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -FACE_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={faces.back} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Scene({ items, label, target, onReveal }) {
  const rig = useRef();
  const order = useRef(0);
  const lastPointer = useRef("mouse");
  const [active, setActive] = useState(null);
  const [font, setFont] = useState("system-ui, sans-serif");
  const { size, viewport } = useThree();

  // Use the site's display font for the labels once it has loaded.
  useEffect(() => {
    let alive = true;
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() ||
      "system-ui, sans-serif";
    const apply = () => alive && setFont(`${family}, system-ui, sans-serif`);
    if (document.fonts?.load) {
      document.fonts.load(`800 60px ${family}`).then(apply, apply);
    } else {
      apply();
    }
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    onReveal?.(active);
  }, [active, onReveal]);

  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(CARD_W, CARD_H, 0.13), {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 3,
      curveSegments: 10,
    });
    g.center();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Portrait screens get a 2-column grid of six larger cards.
  const layout = useMemo(() => {
    const portrait = size.width / size.height < 0.95;
    const cols = portrait ? 2 : 3;
    const count = portrait ? 6 : 9;
    const rows = Math.ceil(count / cols);
    const stepX = CARD_W + GAP_X;
    const stepY = CARD_H + GAP_Y;
    const grid = Array.from({ length: count }, (_, i) => [
      ((i % cols) - (cols - 1) / 2) * stepX,
      ((rows - 1) / 2 - Math.floor(i / cols)) * stepY,
      0,
    ]);
    const needW = cols * stepX + 0.5;
    const needH = rows * stepY + 0.9;
    const scale = Math.min(1.12, viewport.width / needW, viewport.height / needH);
    // Keep the landscape scatter inside the canvas: its outermost cards sit
    // at ±2.9 (x) and ±2.05 (y), plus room for the card itself.
    const halfW = viewport.width / (2 * scale);
    const halfH = viewport.height / (2 * scale);
    if (portrait) {
      // The portrait scatter is already sized for a narrow canvas.
      const spreadY = Math.min(1.15, Math.max(0.6, (halfH - CARD_H * 0.7) / 2.0));
      return { count, grid, scale, scatter: SCATTER_PORTRAIT, spreadX: 1, spreadY };
    }
    const spreadX = Math.min(1, Math.max(0.3, (halfW - CARD_W * 0.72) / 2.9));
    const spreadY = Math.min(1.1, Math.max(0.4, (halfH - CARD_H * 0.8) / 2.05));
    return { count, grid, scale, scatter: SCATTER, spreadX, spreadY };
  }, [size.width, size.height, viewport.width, viewport.height]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    order.current = damp(order.current, target.current, 3.2, dt);
    const g = rig.current;
    if (!g) return;
    const ease = 1 - order.current * 0.6;
    g.rotation.y = damp(g.rotation.y, state.pointer.x * 0.24 * ease, 3, dt);
    g.rotation.x = damp(g.rotation.x, -state.pointer.y * 0.15 * ease, 3, dt);
  });

  // Mouse: hovering reveals. Touch / pen: tapping toggles.
  const handlers = useMemo(
    () => ({
      down: (e) => {
        lastPointer.current = e.nativeEvent.pointerType || "mouse";
      },
      over: (e, i) => {
        if ((e.nativeEvent.pointerType || "mouse") !== "mouse") return;
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        setActive(i);
      },
      out: (e, i) => {
        if ((e.nativeEvent.pointerType || "mouse") !== "mouse") return;
        document.body.style.cursor = "";
        setActive((a) => (a === i ? null : a));
      },
      click: (e, i) => {
        if (lastPointer.current === "mouse") return;
        e.stopPropagation();
        setActive((a) => (a === i ? null : i));
      },
    }),
    []
  );
  useEffect(() => () => void (document.body.style.cursor = ""), []);

  return (
    <>
      <Environment />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={1.3} />
      <pointLight position={[-5, -2, 4]} intensity={30} color={tokens.cool} />
      <group ref={rig} scale={layout.scale}>
        {items.slice(0, layout.count).map((item, i) => (
          <Card
            key={i}
            index={i}
            item={item}
            label={label}
            geometry={geometry}
            font={font}
            layout={layout}
            order={order}
            flipped={active === i}
            handlers={handlers}
          />
        ))}
      </group>
    </>
  );
}

// `target` is a ref holding 0 (scattered) … 1 (tidy), written by the parent
// from scroll position and the "Rapikan kartu" button.
export default function HeroScene({ items, label, target, running, onReveal, onReady }) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={running ? "always" : "never"}
      style={{ touchAction: "pan-y" }}
      onCreated={() => onReady?.()}
    >
      <Scene items={items} label={label} target={target} onReveal={onReveal} />
    </Canvas>
  );
}
