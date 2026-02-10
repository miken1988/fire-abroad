'use client';

import { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    
    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.5,
      rotation: Math.random() * 360,
      size: 4 + Math.random() * 6,
    }));
    
    setPieces(newPieces);
    setVisible(true);
    
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            borderRadius: p.size > 7 ? '50%' : '1px',
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
