import { useEffect, useRef } from "react";

/** Decorative only: bounded density, 30fps, and no work while hidden. */
export function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: -1000, y: -1000 };
    let width = 0, height = 0, frame = 0, last = 0, phase = 0;
    let visible = false;
    let ink = "";
    let nodes: { x: number; y: number; seed: number }[] = [];

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      const points = nodes.map((node) => {
        const x = node.x + Math.sin(phase + node.seed) * 9;
        const y = node.y + Math.cos(phase * .7 + node.seed) * 9;
        const dx = pointer.x - x, dy = pointer.y - y;
        const distance = Math.hypot(dx, dy);
        const attraction = motion.matches ? 0 : Math.max(0, 1 - distance / 180) * .055;
        return { x: x + dx * attraction, y: y + dy * attraction, near: distance < 180 };
      });
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        if (!a) continue;
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          if (!b) continue;
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > 155) continue;
          ctx.globalAlpha = (1 - distance / 155) * (a.near || b.near ? .48 : .26);
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        ctx.globalAlpha = a.near ? .8 : .42;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.near ? 2.8 : 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const tick = (time: number) => {
      if (time - last >= 33) {
        phase += Math.min(time - last, 70) * .00022;
        last = time;
        paint();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      paint();
      if (visible && !document.hidden && !motion.matches) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const resize = () => {
      width = host.clientWidth; height = host.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(76, Math.max(26, Math.floor(width * height / 8500)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: ((i * .61803398875) % 1) * width,
        y: ((i * .41421356237 + .17) % 1) * height,
        seed: i * 2.399,
      }));
      paint();
    };
    const theme = () => { ink = getComputedStyle(canvas).getPropertyValue("--neural-ink").trim(); paint(); };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || motion.matches) return;
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    };
    const leave = () => { pointer.x = -1000; pointer.y = -1000; };
    const sizing = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; sync(); });
    const themes = new MutationObserver(theme);
    theme(); resize(); sizing.observe(host); intersection.observe(host);
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame); sizing.disconnect(); intersection.disconnect(); themes.disconnect();
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="neural-canvas" />;
}