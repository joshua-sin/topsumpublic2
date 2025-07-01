import React from 'react';
import { motion } from 'framer-motion';
import { useCardGame } from '@/lib/stores/useCardGame';

export function DeckSelector() {
  const { activeTargetDeck, setActiveTargetDeck, hasActiveAlgebraDeck } = useCardGame();

  // If there's no active algebra deck, don't show the selector
  if (!hasActiveAlgebraDeck) return null;

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-3 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="text-center font-medium mb-2">Select Target Deck:</div>
      
      <div className="flex gap-2">
        <button 
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${activeTargetDeck === 'grind' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveTargetDeck('grind')}
        >
          Grind Deck
        </button>
        
        <button 
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${activeTargetDeck === 'algebra' 
              ? 'bg-black text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveTargetDeck('algebra')}
        >
          Algebra Deck
        </button>
      </div>
    </motion.div>
  );
}