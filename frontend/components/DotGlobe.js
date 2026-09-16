'use client';

import React, { useEffect, useRef } from 'react';

export function DotGlobe({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 500;
      height = canvas.height = canvas.parentElement.clientHeight || 500;
    };
    window.addEventListener('resize', handleResize);

    const DOTS_COUNT = 850;
    const radius = Math.min(width, height) * 0.42;
    const dots = [];

    for (let i = 0; i < DOTS_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / DOTS_COUNT);
      const theta = Math.sqrt(DOTS_COUNT * Math.PI) * phi;
      dots.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.55;
      const cy = height * 0.5;

      angle += 0.0035;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const tilt = 0.22;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      // Draw faint atmosphere glow
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.15);
      grad.addColorStop(0, 'rgba(0, 117, 255, 0.12)');
      grad.addColorStop(0.6, 'rgba(0, 117, 255, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Sort dots by depth for clean rendering
      const projected = dots.map((d) => {
        // Rotate around Y
        const rx = d.x * cosA - d.z * sinA;
        const rz = d.x * sinA + d.z * cosA;
        // Tilt around X
        const ry = d.y * cosT - rz * sinT;
        const finalZ = d.y * sinT + rz * cosT;

        return {
          px: cx + rx,
          py: cy + ry,
          z: finalZ,
        };
      });

      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        // Opacity and size based on depth
        const alpha = Math.max(0.1, (p.z + radius) / (2 * radius));
        const size = 1.0 + alpha * 1.5;

        ctx.fillStyle = `rgba(0, 117, 255, ${alpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pointer-events-none ${className}`} />;
}
