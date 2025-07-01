import React from 'react';
import { motion } from 'framer-motion';

interface DeckProps {
  cardCount: number;
  onDraw?: () => void;
  soloGameMode?: string;
  remainingCards?: number;
}

export function Deck({ cardCount, onDraw, soloGameMode, remainingCards }: DeckProps) {
  return (
    <div className="relative" onClick={onDraw}>
      {/* Display multiple "stacked" cards based on count */}
      {Array.from({ length: Math.min(5, Math.max(1, cardCount)) }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-24 h-36 rounded-lg border-4 border-white bg-gray-800 shadow-lg"
          style={{
            top: i * -2,
            left: i * -2,
            zIndex: -i
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
      
      {/* Top card */}
      <motion.div
        className="relative w-24 h-36 rounded-lg border-4 border-white bg-gray-700 shadow-lg flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <span className="text-white font-bold text-lg">DECK</span>
        {soloGameMode === 'deck_limited' && remainingCards !== undefined ? (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white w-8 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {remainingCards}
          </div>
        ) : cardCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {cardCount}
          </div>
        )}
      </motion.div>
    </div>
  );
}
