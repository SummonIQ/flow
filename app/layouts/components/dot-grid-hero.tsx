'use client';

import { useEffect, useRef } from 'react';

export function DotGridHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || window.innerWidth;
      canvas.height = parent?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -1000, y: -1000 };
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        mouse.x = -1000;
        mouse.y = -1000;
        return;
      }

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouse.x = x * scaleX;
      mouse.y = y * scaleY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const spacing = 50;
    let time = 0;

    const animate = () => {
      time += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let x = spacing; x < canvas.width; x += spacing) {
        for (let y = spacing; y < canvas.height; y += spacing) {
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          const influence = Math.max(0, 1 - distToMouse / 250);

          const size = 1.5 + influence * 2;
          const alpha = 0.04 + influence * 0.15;

          const wave = Math.sin(x * 0.015 + y * 0.015 + time) * 0.5 + 0.5;

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);

          if (influence > 0) {
            ctx.fillStyle = `rgba(0, 191, 255, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(150, 150, 160, ${0.04 + wave * 0.02})`;
          }
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
