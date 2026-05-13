'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  show: boolean;
  duration?: number;
}

export default function Confetti({ show, duration = 2500 }: ConfettiProps) {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    if (show) {
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
      const newPieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * 100,
        size: 6 + Math.random() * 10,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 2,
      }));
      setPieces(newPieces);
      const t = setTimeout(() => setPieces([]), duration);
      return () => clearTimeout(t);
    }
  }, [show, duration]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -50, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
              animate={{
                y: '110vh',
                rotate: p.rotate + 720,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size * 0.4,
                background: p.color,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}