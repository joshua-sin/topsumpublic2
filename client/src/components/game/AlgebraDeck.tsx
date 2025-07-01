import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardComponent } from './Card';
import { Card } from '@/types/card';

interface AlgebraDeckProps {
  cards: Card[];
  algebraFunction: string;
  onClick?: () => void;
}

export function AlgebraDeck({ cards, algebraFunction, onClick }: AlgebraDeckProps) {
  // Only show the last few cards for visualization
  const visibleCards = cards.slice(Math.max(0, cards.length - 5));
  
  return (
    <div 
      className="flex flex-col items-center gap-4"
      onClick={onClick}
    >
      <motion.div
        className="text-xl font-bold bg-black text-white px-4 py-2 rounded-lg shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        key={algebraFunction} // Re-animate when function changes
        transition={{ type: "spring", stiffness: 300 }}
      >
        f(x) = {algebraFunction}
      </motion.div>
      
      <div className="relative h-36 w-24">
        <AnimatePresence>
          {visibleCards.map((card, index) => (
            <motion.div
              key={card.id}
              className="absolute"
              initial={{ 
                y: -50,
                x: index * 5,
                opacity: 0, 
                rotateZ: (Math.random() - 0.5) * 10 
              }}
              animate={{ 
                y: 0,
                x: index * 5,
                opacity: 1, 
                rotateZ: (Math.random() - 0.5) * 5,
                zIndex: index
              }}
              exit={{ 
                y: 100, 
                opacity: 0,
                transition: { duration: 0.2 } 
              }}
              transition={{ type: "spring", damping: 15 }}
            >
              <CardComponent 
                card={card} 
                index={index}
                isInHand={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <motion.div
        className="bg-gray-800 text-white text-sm px-4 py-1 rounded-lg mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Algebra Deck
      </motion.div>
    </div>
  );
}