import { useEffect, useRef, type PointerEvent } from "react";

/** Geometry is updated without React renders; touch keeps the quiet glass finish. */
export function useCardEffects<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset["effectVisible"] = String(entry?.isIntersecting ?? false);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return {
    ref,
    onPointerMove: (event: PointerEvent<T>) => {
      if (event.pointerType === "touch") return;
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      element.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      element.dataset["spotlight"] = "true";
    },
    onPointerLeave: (event: PointerEvent<T>) => { delete event.currentTarget.dataset["spotlight"]; },
  };
}