import { useEffect, useRef } from "react";

type Place = { lat: number; lon: number; home?: boolean };

// Thorold (home base) plus a few places the studio works with.
const PLACES: Place[] = [
  { lat: 43.12, lon: -79.2, home: true },
  { lat: 51.5, lon: -0.12 },
  { lat: 25.2, lon: 55.27 },
  { lat: 14.6, lon: 121.0 },
  { lat: -33.87, lon: 151.2 },
  { lat: -23.55, lon: -46.63 },
  { lat: 1.35, lon: 103.82 },
];

const rad = (d: number) => (d * Math.PI) / 180;
const toVec = (lat: number, lon: number): [number, number, number] => {
  const la = rad(lat);
  const lo = rad(lon);
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};

/** Rotating dotted globe drawn on a canvas, with pulsing markers and arcs from the home base. */
export function DottedGlobe({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dots: [number, number, number][] = [];
    let size = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let destroyed = false;
    let angle = rad(70);
    let last = 0;
    const tilt = rad(-18);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = el.clientWidth;
      el.width = Math.round(size * dpr);
      el.height = Math.round(size * dpr);
    };

    const rotate = (v: [number, number, number]): [number, number, number] => {
      const [x, y, z] = v;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      const x1 = x * ca + z * sa;
      const z1 = -x * sa + z * ca;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      return [x1, y * ct - z1 * st, y * st + z1 * ct];
    };

    const draw = (time: number) => {
      const R = size * 0.42;
      const cx = size / 2;
      const cy = size / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // soft atmosphere
      const glow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.18);
      glow.addColorStop(0, "rgba(0,161,214,0.22)");
      glow.addColorStop(1, "rgba(0,161,214,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      ctx.fill();

      const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      body.addColorStop(0, "rgba(19,44,60,0.85)");
      body.addColorStop(1, "rgba(7,18,26,0.9)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,161,214,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const dotR = Math.max(1, size / 420);
      for (const d of dots) {
        const [x, y, z] = rotate(d);
        if (z < 0) continue;
        ctx.fillStyle = `rgba(120,215,245,${0.18 + z * 0.75})`;
        ctx.beginPath();
        ctx.arc(cx + x * R, cy - y * R, dotR * (0.65 + z * 0.55), 0, Math.PI * 2);
        ctx.fill();
      }

      // arcs from home to the other places
      const home = toVec(PLACES[0].lat, PLACES[0].lon);
      for (let i = 1; i < PLACES.length; i++) {
        const to = toVec(PLACES[i].lat, PLACES[i].lon);
        const dot = Math.min(1, Math.max(-1, home[0] * to[0] + home[1] * to[1] + home[2] * to[2]));
        const omega = Math.acos(dot);
        const so = Math.sin(omega) || 1;
        const steps = 48;
        const phase = (time / 2600 + i * 0.37) % 1.6;
        ctx.lineWidth = 1.2;
        let prev: [number, number, boolean] | null = null;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const a = Math.sin((1 - t) * omega) / so;
          const b = Math.sin(t * omega) / so;
          const lift = 1 + Math.sin(Math.PI * t) * 0.22;
          const p: [number, number, number] = [
            (a * home[0] + b * to[0]) * lift,
            (a * home[1] + b * to[1]) * lift,
            (a * home[2] + b * to[2]) * lift,
          ];
          const [x, y, z] = rotate(p);
          const front = z > 0;
          const sx = cx + x * R;
          const sy = cy - y * R;
          if (prev && prev[2] && front) {
            const near = Math.abs(t - phase) < 0.12;
            ctx.strokeStyle = near ? "rgba(77,255,184,0.95)" : "rgba(0,161,214,0.4)";
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(sx, sy);
            ctx.stroke();
          }
          prev = [sx, sy, front];
        }
      }

      // markers
      PLACES.forEach((pl, i) => {
        const [x, y, z] = rotate(toVec(pl.lat, pl.lon));
        if (z <= 0.02) return;
        const sx = cx + x * R;
        const sy = cy - y * R;
        const pulse = (time / 1600 + i * 0.23) % 1;
        ctx.strokeStyle = `rgba(77,255,184,${(1 - pulse) * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(sx, sy, 3 + pulse * (pl.home ? 16 : 11), 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = pl.home ? "#4dffb8" : "#00a1d6";
        ctx.beginPath();
        ctx.arc(sx, sy, pl.home ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Build the dot field from a land/water mask (white = water).
    const img = new Image();
    img.src = "/assets/globe/earth-water.png";
    img.onload = () => {
      const w = 400;
      const h = 200;
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(img, 0, 0, w, h);
      const data = octx.getImageData(0, 0, w, h).data;
      const total = 5200;
      const golden = Math.PI * (3 - Math.sqrt(5));
      const out: [number, number, number][] = [];
      for (let i = 0; i < total; i++) {
        const y = 1 - (i / (total - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const x = Math.sin(theta) * r;
        const z = Math.cos(theta) * r;
        const lat = Math.asin(y);
        const lon = Math.atan2(x, z);
        const px = Math.min(w - 1, Math.max(0, Math.floor(((lon + Math.PI) / (2 * Math.PI)) * w)));
        const py = Math.min(h - 1, Math.max(0, Math.floor((0.5 - lat / Math.PI) * h)));
        if (data[(py * w + px) * 4] < 110) out.push([x, y, z]);
      }
      dots = out;
      if (reduced) draw(0);
    };

    const tick = (now: number) => {
      if (destroyed) return;
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      angle += dt * 0.00012;
      draw(now);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduced || raf || !visible) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    resize();
    if (reduced) draw(0);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        start();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);
    start();

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas aria-hidden="true" className={className} ref={canvas} />;
}
