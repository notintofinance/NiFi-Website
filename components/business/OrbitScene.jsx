"use client";

// The NiFi business ecosystem as a real-time 3D orbit (React Three Fiber).
//
// A small orbital system seen at an angle: the NiFi mark on a glowing core,
// rings, and three units travelling round it (NiFi Academy, NiFi Media,
// NiFi Research). Each unit is a small planet with its own surface (a ringed
// gas giant, a rocky world, an ocean world), a lit side and a dark side, and
// a thin atmosphere. Its logo rides on a plate that always faces the viewer,
// so the names stay readable while the system turns. The Arthara mark
// circles NiFi Research as its moon.
//
// Playing with it:
//   - it turns slowly on its own and stops while the pointer is on a unit
//   - move the pointer: the whole system leans towards it
//   - drag sideways: spin it (it keeps some momentum); drag up or down with
//     a mouse: tip the plane
//   - press a unit: the system turns to bring it forward and the parent
//     shows its summary card; press the core to let go
//
// The parent (BusinessOrbit.jsx) owns the selection, the buttons and the
// card, pauses the render loop off screen, and shows a flat version when
// WebGL or motion is off.

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import tokens from "@/design-tokens";

// The inner ring is empty: units keep their distance from the core so a
// logo plate never lands on it.
const RINGS = [1.3, 2.3, 2.6, 2.9];
const THIRD = (Math.PI * 2) / 3;
// Evenly spaced round the core, each on its own ring, so plates never meet.
// Each planet keeps its unit's hue. `bands` 1 is a striped gas giant, 0 a
// rocky world with continents; `deep`, `mid` and `light` are its surface
// colours from darkest to brightest.
const PARTS = {
  research: {
    ring: 1,
    angle: 1.47,
    color: tokens.play.cyan,
    size: 0.34,
    bands: 0.55,
    seed: 3.1,
    deep: "#06283a",
    mid: "#1587a8",
    light: "#c9f1f7",
  },
  academy: {
    ring: 2,
    angle: 1.47 + THIRD,
    color: tokens.play.violet,
    size: 0.38,
    bands: 1,
    seed: 7.4,
    deep: "#231650",
    mid: "#6747c7",
    light: "#cdbdf6",
    belt: true,
  },
  media: {
    ring: 3,
    angle: 1.47 + THIRD * 2,
    color: tokens.play.pink,
    size: 0.31,
    bands: 0,
    seed: 12.8,
    deep: "#3a0d27",
    mid: "#b03a70",
    light: "#f3b4cf",
  },
};
const FRONT = Math.PI / 2; // angle in the plane that faces the viewer
const BASE_TILT = 0.92; // how far the plane leans back, radians
const IDLE_SPEED = 0.13; // radians per second: slow enough to read the logos
const SWEEP_SPEED = 0.8;
const SWEEP_ARC = Math.PI / 2.4;
const HALF_WIDTH = 4.3; // world units the camera must show left and right
const PLATE_HEIGHT = 0.68;
const PLATE_LIFT = 0.84; // from the centre of a sphere to the centre of its plate
const MOON_ORBIT = 0.58;

const { damp } = THREE.MathUtils;
const wrapAngle = (a) => ((((a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;

// Soft round glow, drawn once on a canvas.
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function canvasTexture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// A unit's logo on a dark rounded plate. The plate is as wide as the logo
// needs; `aspect` is known up front so the sprite has its size before the
// image arrives.
function plateTexture(src, aspect) {
  const c = document.createElement("canvas");
  const pad = 76;
  const logoH = 150;
  c.height = 256;
  c.width = Math.round(logoH * aspect) + pad * 2;
  const ctx = c.getContext("2d");
  const paint = (img) => {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath();
    ctx.roundRect(4, 4, c.width - 8, c.height - 8, 64);
    ctx.fillStyle = "rgba(10, 12, 16, 0.88)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    ctx.stroke();
    if (img) ctx.drawImage(img, pad, (c.height - logoH) / 2, c.width - pad * 2, logoH);
  };
  paint(null);
  const texture = canvasTexture(c);
  const img = new Image();
  img.onload = () => {
    paint(img);
    texture.needsUpdate = true;
  };
  img.src = src;
  return { texture, ratio: c.width / c.height };
}

// Keep the whole system in frame at any canvas shape.
function Framing() {
  const { camera, size, scene } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const z = HALF_WIDTH / (aspect * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.set(0, 0, z);
    camera.updateProjectionMatrix();
    scene.fog = new THREE.Fog(tokens.ink[950], z, z + 9);
  }, [camera, size, scene]);
  return null;
}

// A planet's surface, drawn in the shader: noise makes either latitude bands
// (gas) or continents (rock). It is lit by one fixed key light plus the glow
// of the core, so every planet has a day side and a night side, and a thin
// bright edge stands in for an atmosphere.
const planetVertex = `
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vObj = position;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`;
const planetFragment = `
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uLight;
  uniform vec3 uCore;
  uniform float uSeed;
  uniform float uBands;
  uniform float uBoost;
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vView;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 5; i++) {
      s += a * noise(p);
      p = p * 2.03 + vec3(1.7);
      a *= 0.5;
    }
    return s;
  }

  void main() {
    vec3 p = normalize(vObj);
    float n = fbm(p * 3.0 + uSeed);

    // Gas: latitude stripes, bent and streaked by noise.
    float stripe = 0.5 + 0.5 * sin(p.y * 12.0 + n * 5.5 + uSeed);
    float streak = fbm(vec3(p.x * 2.0, p.y * 10.0, p.z * 2.0) + uSeed);
    float gas = mix(stripe, streak, 0.4);
    // Rock: continents with finer grain on top.
    float rock = smoothstep(0.34, 0.62, n) * 0.72 + fbm(p * 5.0 + uSeed) * 0.3;

    float t = mix(rock, gas, uBands);
    vec3 col = mix(uDeep, uMid, smoothstep(0.12, 0.58, t));
    col = mix(col, uLight, smoothstep(0.62, 0.96, t));

    vec3 N = normalize(vN);
    vec3 V = normalize(-vView);
    vec3 key = normalize(vec3(-0.6, 0.55, 0.58));
    vec3 core = (viewMatrix * vec4(uCore, 1.0)).xyz;
    float day = smoothstep(-0.12, 0.75, dot(N, key));
    float glow = max(dot(N, normalize(core - vView)), 0.0);

    vec3 lit = col * (0.045 + day * 1.6);
    lit += col * vec3(0.55, 0.68, 1.0) * glow * 0.32;
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.8);
    lit += mix(uMid, uLight, 0.6) * rim * (0.18 + 0.82 * day) * 0.85;

    gl_FragColor = vec4(lit * uBoost, 1.0);
    #include <colorspace_fragment>
  }`;

// The belt round the gas giant: thin concentric bands with gaps.
const beltShader = {
  vertexShader: `
    varying vec2 vP;
    void main() {
      vP = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uInner;
    uniform float uOuter;
    uniform float uBoost;
    varying vec2 vP;
    float h(float x) { return fract(sin(x * 91.7) * 43758.5); }
    void main() {
      float r = (length(vP) - uInner) / (uOuter - uInner);
      float band = floor(r * 16.0);
      float a = (0.3 + 0.7 * h(band)) * smoothstep(0.0, 0.06, r) * (1.0 - smoothstep(0.92, 1.0, r));
      a *= 1.0 - 0.85 * step(0.5, r) * step(r, 0.58);
      gl_FragColor = vec4(uColor * uBoost, a * 0.62);
      #include <colorspace_fragment>
    }`,
};

// The beam: a wedge of the plane, bright on its leading edge.
const sweepShader = {
  uniforms: { uColor: { value: new THREE.Color(tokens.cool) }, uArc: { value: SWEEP_ARC } },
  vertexShader: `
    varying vec2 vP;
    void main() {
      vP = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uArc;
    varying vec2 vP;
    void main() {
      float t = 1.0 - clamp(atan(vP.y, vP.x) / uArc, 0.0, 1.0);
      float r = length(vP) / ${RINGS[3].toFixed(2)};
      float a = pow(t, 2.4) * 0.26 * smoothstep(0.0, 0.3, r) * (1.0 - smoothstep(0.92, 1.0, r));
      gl_FragColor = vec4(uColor, a);
    }`,
};

function Part({ unit, glow, state, onSelect, onHover }) {
  const { id } = unit;
  const part = PARTS[id];
  const radius = RINGS[part.ring];
  const group = useRef();
  const planet = useRef();
  const halo = useRef();
  const plate = useRef();
  const moon = useRef();
  const coin = useRef();
  const belt = useRef();
  const axis = useRef();
  const boost = useRef(1);
  // A unit with a moon or a belt holds its plate further out, clear of it.
  const reach = unit.moon || part.belt ? PLATE_LIFT + 0.24 : PLATE_LIFT;
  const below = useRef(Math.sin(part.angle) > 0);
  const lifted = useRef(below.current ? -reach : reach);

  const { texture: plateMap, ratio } = useMemo(() => plateTexture(unit.logo, unit.w / unit.h), [unit.logo, unit.w, unit.h]);
  const moonMap = useMemo(() => {
    if (!unit.moon) return null;
    const t = new THREE.TextureLoader().load(unit.moon);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [unit.moon]);
  const surface = useMemo(
    () => ({
      uDeep: { value: new THREE.Color(part.deep) },
      uMid: { value: new THREE.Color(part.mid) },
      uLight: { value: new THREE.Color(part.light) },
      uCore: { value: new THREE.Vector3() },
      uSeed: { value: part.seed },
      uBands: { value: part.bands },
      uBoost: { value: 1 },
    }),
    [part]
  );
  const beltUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(part.light) },
      uInner: { value: part.size * 1.32 },
      uOuter: { value: part.size * 1.95 },
      uBoost: { value: 1 },
    }),
    [part]
  );
  useEffect(
    () => () => {
      plateMap.dispose();
      moonMap?.dispose();
    },
    [plateMap, moonMap]
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    const chosen = s.selected === id;
    const hovered = s.hovered === id;
    const faded = s.selected != null && !chosen;
    s.ping[id] = Math.max(0, (s.ping[id] || 0) - dt * 1.6);
    const ping = s.ping[id];

    const size = chosen ? 1.28 : hovered ? 1.16 : 1 + ping * 0.05;
    group.current.scale.setScalar(damp(group.current.scale.x, size, 7, dt));

    // The planet turns on its own axis; it brightens under the pointer and
    // as the beam passes, and dims while another unit is selected.
    // Its axis keeps pointing the same way all round the orbit, so the belt
    // is always seen at the same slant.
    axis.current.rotation.set(-0.62, -s.rot, 0.22, "YXZ");
    planet.current.rotation.y += dt * 0.22;
    boost.current = damp(boost.current, (faded ? 0.4 : chosen ? 1.3 : hovered ? 1.2 : 1) + ping * 0.35, 8, dt);
    surface.uBoost.value = boost.current;
    surface.uCore.value.copy(s.core);
    if (belt.current) beltUniforms.uBoost.value = boost.current;
    halo.current.material.opacity = damp(
      halo.current.material.opacity,
      (faded ? 0.04 : chosen ? 0.42 : hovered ? 0.3 : 0.1) + ping * 0.2,
      10,
      dt
    );
    plate.current.material.opacity = damp(plate.current.material.opacity, faded ? 0.3 : 1, 8, dt);

    // A plate sits on the outside of the orbit: above its planet on the far
    // side, below it on the near side, so it never covers the core. It is
    // kept straight above or below the planet on screen, whatever the tilt
    // and spin of the plane it rides in.
    const near = Math.sin(part.angle - s.rot);
    if (near > 0.22) below.current = true;
    else if (near < -0.22) below.current = false;
    const lift = (lifted.current = damp(lifted.current, below.current ? -reach : reach, 7, dt));
    const back = -lift * Math.sin(s.tilt);
    plate.current.position.set(-back * Math.sin(s.rot), lift * Math.cos(s.tilt), back * Math.cos(s.rot));

    if (moon.current) {
      if (!hovered) moon.current.rotation.y += dt * (chosen ? 0.45 : 0.8);
      coin.current.material.opacity = damp(coin.current.material.opacity, faded ? 0.3 : 1, 8, dt);
    }
  });

  const over = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    onHover(id);
  };
  const out = () => {
    document.body.style.cursor = "";
    onHover(null);
  };
  const press = (e) => {
    e.stopPropagation();
    if (e.delta < 7) onSelect(id);
  };
  const hit = { onPointerOver: over, onPointerOut: out, onClick: press };

  return (
    <group ref={group} position={[radius * Math.cos(part.angle), 0, radius * Math.sin(part.angle)]}>
      {/* The planet, leaning on its axis */}
      <group ref={axis}>
        <mesh ref={planet} {...hit}>
          <sphereGeometry args={[part.size, 64, 64]} />
          <shaderMaterial vertexShader={planetVertex} fragmentShader={planetFragment} uniforms={surface} />
        </mesh>
        {part.belt && (
          <mesh ref={belt} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[part.size * 1.32, part.size * 1.95, 96]} />
            <shaderMaterial
              args={[beltShader]}
              uniforms={beltUniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
      {/* Bigger invisible target, so the unit is easy to press */}
      <mesh {...hit}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* A faint haze of atmosphere */}
      <sprite ref={halo} scale={[part.size * 4.6, part.size * 4.6, 1]}>
        <spriteMaterial
          map={glow}
          color={part.color}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* The unit's logo, always facing the viewer */}
      <sprite ref={plate} scale={[PLATE_HEIGHT * ratio, PLATE_HEIGHT, 1]} {...hit}>
        <spriteMaterial map={plateMap} transparent depthWrite={false} />
      </sprite>

      {/* The Arthara mark circles NiFi Research */}
      {moonMap && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[MOON_ORBIT, 0.005, 6, 72]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.28} />
          </mesh>
          <group ref={moon}>
            <sprite ref={coin} position={[MOON_ORBIT, 0, 0]} scale={[0.3, 0.3 * (unit.moonH / unit.moonW), 1]} {...hit}>
              <spriteMaterial map={moonMap} transparent depthWrite={false} />
            </sprite>
          </group>
        </>
      )}
    </group>
  );
}

function System({ units, selected, hovered, focus, onSelect, onHover }) {
  const { gl } = useThree();
  const tilt = useRef();
  const spin = useRef();
  const sweep = useRef();
  const pulse = useRef();
  const dust = useRef();
  const link = useRef();
  const rings = useRef([]);
  const mark = useRef();

  // Everything that changes every frame lives here, not in React state.
  const state = useRef({
    selected: null,
    hovered: null,
    focus,
    rot: 0,
    tilt: BASE_TILT,
    core: new THREE.Vector3(0, 0.4, 0),
    speed: IDLE_SPEED,
    target: null,
    lean: 0,
    sweep: 0,
    pulse: 0,
    ping: {},
    drag: null,
  });
  state.current.hovered = hovered;
  state.current.focus = focus;

  // Follow the selection made anywhere (units, buttons, the card).
  useEffect(() => {
    const s = state.current;
    s.selected = selected;
    s.target = selected == null ? null : PARTS[selected].angle - FRONT - focus.turn;
  }, [selected, focus.turn]);

  const glow = useMemo(() => glowTexture(), []);
  // The core is drawn like the planets, in NiFi navy.
  const coreSurface = useMemo(
    () => ({
      uDeep: { value: new THREE.Color("#0c1a3a") },
      uMid: { value: new THREE.Color("#1f3a72") },
      uLight: { value: new THREE.Color("#5f86e6") },
      uCore: { value: new THREE.Vector3(0, 0, 60) },
      uSeed: { value: 21.3 },
      uBands: { value: 0.35 },
      uBoost: { value: 1.25 },
    }),
    []
  );
  const markMap = useMemo(() => {
    const t = new THREE.TextureLoader().load("/nifi-mark-white.png");
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const dustGeometry = useMemo(() => {
    const n = 220;
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 3.2 + Math.random() * 3.2;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = r * Math.cos(a);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.4;
      positions[i * 3 + 2] = r * Math.sin(a);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  const linkGeometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]),
    []
  );
  useEffect(
    () => () => {
      glow.dispose();
      markMap.dispose();
      dustGeometry.dispose();
      linkGeometry.dispose();
    },
    [glow, markMap, dustGeometry, linkGeometry]
  );

  // Drag on the canvas: sideways spins, up/down (mouse only) tips the plane.
  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const down = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      s.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moving: false, last: performance.now(), v: 0, mouse: e.pointerType === "mouse" };
    };
    const move = (e) => {
      const d = s.drag;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moving) {
        if (Math.hypot(dx, dy) < 6) return;
        // On touch, a mostly vertical move is the page scrolling.
        if (!d.mouse && Math.abs(dy) > Math.abs(dx)) {
          s.drag = null;
          return;
        }
        d.moving = true;
        el.setPointerCapture?.(e.pointerId);
        if (s.selected != null) onSelect(null);
      }
      const now = performance.now();
      const turn = dx * 0.0085;
      s.rot += turn;
      d.v = d.v * 0.6 + (turn / Math.max(0.001, (now - d.last) / 1000)) * 0.4;
      d.last = now;
      if (d.mouse) s.lean = THREE.MathUtils.clamp(s.lean + dy * 0.004, -0.45, 0.5);
      d.x = e.clientX;
      d.y = e.clientY;
    };
    const up = (e) => {
      const d = s.drag;
      if (!d || d.id !== e.pointerId) return;
      if (d.moving) s.speed = THREE.MathUtils.clamp(d.v, -6, 6);
      s.drag = null;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      document.body.style.cursor = "";
    };
  }, [gl, onSelect]);

  useFrame((three, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;

    // Spin: settle on the selected unit, hold still under the pointer, or
    // coast back to the idle speed.
    if (!s.drag?.moving) {
      if (s.target != null) {
        s.rot += wrapAngle(s.target - s.rot) * Math.min(1, dt * 4);
      } else {
        const goal = s.hovered ? 0 : IDLE_SPEED;
        s.speed += (goal - s.speed) * Math.min(1, dt * (s.hovered ? 6 : 1.3));
        s.rot += s.speed * dt;
      }
    }
    spin.current.rotation.y = s.rot;

    // Lean towards the pointer, on top of the tilt set by dragging. With a
    // unit selected the system steps aside for the summary card.
    const p = three.pointer;
    const on = s.selected != null;
    tilt.current.rotation.x = damp(tilt.current.rotation.x, BASE_TILT + s.lean - p.y * 0.14, 4, dt);
    s.tilt = tilt.current.rotation.x;
    tilt.current.rotation.z = damp(tilt.current.rotation.z, -p.x * 0.08, 4, dt);
    tilt.current.rotation.y = damp(tilt.current.rotation.y, p.x * 0.18, 4, dt);
    tilt.current.position.x = damp(tilt.current.position.x, on ? s.focus.x : 0, 4, dt);
    tilt.current.scale.setScalar(damp(tilt.current.scale.x, on ? s.focus.scale : 1, 4, dt));
    s.core.copy(tilt.current.position);
    mark.current.position.x = tilt.current.position.x;
    mark.current.scale.set(0.72 * tilt.current.scale.x, 0.703 * tilt.current.scale.x, 1);

    // The beam, and a flash on each unit as it passes.
    s.sweep -= SWEEP_SPEED * dt;
    sweep.current.rotation.y = s.sweep;
    for (const id of Object.keys(PARTS)) {
      const seen = wrapAngle(PARTS[id].angle - s.rot + s.sweep);
      if (Math.abs(seen) < 0.07 && (s.ping[id] || 0) < 0.25) s.ping[id] = 1;
    }

    // A ripple leaving the core.
    s.pulse = (s.pulse + dt / 3.6) % 1;
    const size = 0.8 + s.pulse * 2.3;
    pulse.current.scale.set(size, size, size);
    pulse.current.material.opacity = (1 - s.pulse) * 0.4;

    dust.current.rotation.y -= dt * 0.02;

    // Rings: the selected unit's ring lights up.
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const lit = on && PARTS[s.selected].ring === i;
      ring.material.opacity = damp(ring.material.opacity, lit ? 0.95 : 0.26, 6, dt);
    });

    // The link from the core to the selected unit.
    const chosen = on ? PARTS[s.selected] : null;
    link.current.material.opacity = damp(link.current.material.opacity, chosen ? 0.9 : 0, 6, dt);
    if (chosen) {
      link.current.rotation.y = -chosen.angle;
      link.current.scale.x = damp(link.current.scale.x, RINGS[chosen.ring], 6, dt);
    }

    // The NiFi mark breathes a little.
    mark.current.material.opacity = 0.92 + Math.sin(three.clock.elapsedTime * 1.6) * 0.08;
  });

  return (
    <>
      <Framing />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 6]} intensity={1.2} />
      <pointLight position={[0, 0.6, 0]} intensity={14} color={tokens.cool} />

      <group ref={tilt} position={[0, 0.4, 0]} rotation={[BASE_TILT, 0, 0]}>
        {/* Rings, ripple and beam lie in the plane and do not turn with the units */}
        {RINGS.map((r, i) => (
          <mesh key={r} ref={(el) => (rings.current[i] = el)} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.008, 8, 160]} />
            <meshBasicMaterial color={tokens.cool} transparent opacity={0.26} />
          </mesh>
        ))}
        <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.985, 1, 96]} />
          <meshBasicMaterial color={tokens.cool} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <group ref={sweep}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[RINGS[3], 64, 0, SWEEP_ARC]} />
            <shaderMaterial
              args={[sweepShader]}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>

        {/* Core */}
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            if (e.delta < 7) onSelect(null);
          }}
        >
          <sphereGeometry args={[0.66, 64, 64]} />
          <shaderMaterial vertexShader={planetVertex} fragmentShader={planetFragment} uniforms={coreSurface} />
        </mesh>
        <sprite scale={[3.4, 3.4, 1]}>
          <spriteMaterial
            map={glow}
            color={tokens.cool}
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>

        {/* The units turn together */}
        <group ref={spin}>
          {units.map((unit) => (
            <Part key={unit.id} unit={unit} glow={glow} state={state} onSelect={onSelect} onHover={onHover} />
          ))}
          <line ref={link} geometry={linkGeometry}>
            <lineBasicMaterial color="#ffffff" transparent opacity={0} />
          </line>
        </group>

        <points ref={dust} geometry={dustGeometry}>
          <pointsMaterial
            map={glow}
            color={tokens.cool}
            size={0.07}
            sizeAttenuation
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      {/* The NiFi mark always faces the viewer, just in front of the core */}
      <sprite ref={mark} position={[0, 0.4, 0.74]} scale={[0.72, 0.703, 1]}>
        <spriteMaterial map={markMap} transparent depthWrite={false} />
      </sprite>
    </>
  );
}

export default function OrbitScene({ units, selected, hovered, focus, running, onSelect, onHover, onReady }) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 12], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={running ? "always" : "never"}
      style={{ touchAction: "pan-y", cursor: "grab" }}
      onCreated={() => onReady?.()}
    >
      <System units={units} selected={selected} hovered={hovered} focus={focus} onSelect={onSelect} onHover={onHover} />
    </Canvas>
  );
}
