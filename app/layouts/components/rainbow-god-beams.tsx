'use client';

import { useState, useEffect, useRef, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type RainbowGodBeamsProps = ComponentProps<'div'>;

export function RainbowGodBeams({ className, ...props }: RainbowGodBeamsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setMousePos({ x: -1000, y: -1000 });
        setIsActive(false);
        return;
      }
      setMousePos({ x, y });
      setIsActive(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const maskStyle = isActive
    ? `radial-gradient(circle 280px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0.7) 0%, transparent 100%)`
    : 'radial-gradient(circle 0px at -1000px -1000px, transparent 0%, transparent 100%)';

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className,
      )}
      {...props}
    >
      {/* Light mode beams */}
      <div className="absolute inset-0 overflow-hidden dark:hidden">
        <div
          className="-inset-[10px] pointer-events-none absolute opacity-15"
          style={{
            backgroundImage: `repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%), repeating-linear-gradient(100deg, #60a5fa 10%, #e879f9 15%, #60a5fa 20%, #5eead4 25%, #60a5fa 30%)`,
            backgroundPosition: '50% 50%, 50% 50%',
            backgroundSize: '300%, 200%',
            filter: 'invert(100%)',
            maskImage: maskStyle,
            WebkitMaskImage: maskStyle,
            transition:
              'mask-image 0.1s ease-out, -webkit-mask-image 0.1s ease-out',
          }}
        >
          <span
            className="absolute inset-0"
            style={{
              animation: 'jumbo 60s linear infinite',
              backgroundAttachment: 'fixed',
              backgroundImage: `repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%), repeating-linear-gradient(100deg, #60a5fa 10%, #e879f9 15%, #60a5fa 20%, #5eead4 25%, #60a5fa 30%)`,
              backgroundSize: '200%, 100%',
              content: '""',
              mixBlendMode: 'difference',
              position: 'absolute',
              zIndex: 1,
            }}
          />
        </div>
      </div>
      {/* Dark mode beams */}
      <div className="absolute inset-0 overflow-hidden hidden dark:block">
        <div
          className="-inset-[10px] pointer-events-none absolute opacity-12"
          style={{
            backgroundImage: `repeating-linear-gradient(100deg, #1e293b 0%, #1e293b 7%, transparent 10%, transparent 12%, #1e293b 16%), repeating-linear-gradient(100deg, #3b82f6 10%, #c026d3 15%, #3b82f6 20%, #14b8a6 25%, #3b82f6 30%)`,
            backgroundPosition: '50% 50%, 50% 50%',
            backgroundSize: '300%, 200%',
            maskImage: maskStyle,
            WebkitMaskImage: maskStyle,
            transition:
              'mask-image 0.1s ease-out, -webkit-mask-image 0.1s ease-out',
          }}
        >
          <span
            className="absolute inset-0"
            style={{
              animation: 'jumbo 60s linear infinite',
              backgroundAttachment: 'fixed',
              backgroundImage: `repeating-linear-gradient(100deg, #1e293b 0%, #1e293b 7%, transparent 10%, transparent 12%, #1e293b 16%), repeating-linear-gradient(100deg, #3b82f6 10%, #c026d3 15%, #3b82f6 20%, #14b8a6 25%, #3b82f6 30%)`,
              backgroundSize: '200%, 100%',
              content: '""',
              mixBlendMode: 'screen',
              position: 'absolute',
              zIndex: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}
