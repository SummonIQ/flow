'use client';

import { Minus, Square, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function WindowControls() {
  const [mounted, setMounted] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsElectron(typeof window !== 'undefined' && !!window.electron);
    setIsMacOS(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleMinimize = () => {
    if (window.electron) {
      window.electron.window.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electron) {
      window.electron.window.maximize();
    }
  };

  const handleClose = () => {
    if (window.electron) {
      window.electron.window.close();
    }
  };

  // Only show in Electron on non-macOS platforms (macOS uses native traffic lights)
  if (!mounted || !isElectron || isMacOS) {
    return null;
  }

  return (
    <div 
      className="flex gap-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Close button - Red */}
      <button
        onClick={handleClose}
        className="w-3 h-3 rounded-full transition-all group relative overflow-hidden"
        style={{
          background: isHovered 
            ? '#FF5F57' 
            : 'linear-gradient(135deg, #A0A0A0 0%, #404040 100%)'
        }}
        aria-label="Close"
        title="Close"
      >
        {isHovered && (
          <X size={8} className="absolute inset-0 m-auto text-[#8C0000] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
        )}
      </button>

      {/* Minimize button - Yellow */}
      <button
        onClick={handleMinimize}
        className="w-3 h-3 rounded-full transition-all group relative overflow-hidden"
        style={{
          background: isHovered 
            ? '#FEBC2E' 
            : 'linear-gradient(135deg, #A0A0A0 0%, #404040 100%)'
        }}
        aria-label="Minimize"
        title="Minimize"
      >
        {isHovered && (
          <Minus size={8} className="absolute inset-0 m-auto text-[#8C5700] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
        )}
      </button>

      {/* Maximize button - Green */}
      <button
        onClick={handleMaximize}
        className="w-3 h-3 rounded-full transition-all group relative overflow-hidden"
        style={{
          background: isHovered 
            ? '#28C840' 
            : 'linear-gradient(135deg, #A0A0A0 0%, #404040 100%)'
        }}
        aria-label="Maximize"
        title="Maximize"
      >
        {isHovered && (
          <Square size={6} className="absolute inset-0 m-auto text-[#006400] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
