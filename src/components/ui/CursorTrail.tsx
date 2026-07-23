import React, { useEffect, useRef } from "react";

export interface CursorTrailProps {
  /**
   * Color of the ink stroke trail.
   * Defaults to Mulu Yu Kalam's signature molten ember: #ff7b01
   */
  color?: string;
  /**
   * Number of spring points in the physics chain.
   * Default: 40 (matching hype-tattoo.com)
   */
  pointsCount?: number;
  /**
   * Multiplier for stroke taper width.
   * Default: 0.3 (produces ~12px needle base tapering to ~0.3px sharp tip)
   */
  widthFactor?: number;
  /**
   * Spring stiffness parameter.
   * Default: 0.4
   */
  spring?: number;
  /**
   * Inertial damping friction coefficient.
   * Default: 0.5
   */
  friction?: number;
  /**
   * Whether to glide in a gentle Lissajous loop before the first user mouse move.
   * Default: true
   */
  enableIdleMotion?: boolean;
}

interface Point {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export const CursorTrail: React.FC<CursorTrailProps> = ({
  color = "#ff7b01",
  pointsCount = 40,
  widthFactor = 0.3,
  spring = 0.4,
  friction = 0.5,
  enableIdleMotion = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animFrameId: number;
    let mouseMoved = false;

    const pointer = {
      x: 0.5 * window.innerWidth,
      y: 0.5 * window.innerHeight,
    };

    // Initialize point chain
    const trail: Point[] = Array.from({ length: pointsCount }, () => ({
      x: pointer.x,
      y: pointer.y,
      dx: 0,
      dy: 0,
    }));

    const updateMousePosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseMoved = true;
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleClick = (e: MouseEvent) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.targetTouches.length > 0) {
        mouseMoved = true;
        updateMousePosition(
          e.targetTouches[0].clientX,
          e.targetTouches[0].clientY,
        );
      }
    };

    const setupCanvas = () => {
      if (!canvas) return;
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    setupCanvas();

    const render = (t: number) => {
      // Lissajous autonomous drift before user interacts
      if (!mouseMoved && enableIdleMotion) {
        pointer.x =
          (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) *
          window.innerWidth;
        pointer.y =
          (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) *
          window.innerHeight;
      }

      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Spring-friction point kinematics
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const prev = i === 0 ? pointer : trail[i - 1];
        const pointSpring = i === 0 ? 0.4 * spring : spring;

        p.dx += (prev.x - p.x) * pointSpring;
        p.dy += (prev.y - p.y) * pointSpring;
        p.dx *= friction;
        p.dy *= friction;
        p.x += p.dx;
        p.y += p.dy;
      }

      // Smooth Bezier spline rendering with tapering width
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      let prevX = trail[0].x;
      let prevY = trail[0].y;

      for (let i = 1; i < trail.length - 1; i++) {
        const xc = 0.5 * (trail[i].x + trail[i + 1].x);
        const yc = 0.5 * (trail[i].y + trail[i + 1].y);

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = Math.max(0.2, widthFactor * (pointsCount - i));
        ctx.stroke();

        prevX = xc;
        prevY = yc;
      }

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
      ctx.lineWidth = Math.max(0.1, widthFactor);
      ctx.stroke();

      animFrameId = window.requestAnimationFrame(render);
    };

    animFrameId = window.requestAnimationFrame(render);

    const handleResize = () => {
      setupCanvas();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        window.cancelAnimationFrame(animFrameId);
      } else {
        animFrameId = window.requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.cancelAnimationFrame(animFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [color, pointsCount, widthFactor, spring, friction, enableIdleMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
};
