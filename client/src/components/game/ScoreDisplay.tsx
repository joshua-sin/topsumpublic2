import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useCardGame } from '@/lib/stores/useCardGame';

export function ScoreDisplay() {
  const currentScore = useCardGame(state => state.player?.currentScore || 0);
  const highScore = useCardGame(state => state.highScore);
  const controls = useAnimation();
  const prevScore = useRef(currentScore);
  
  // Animate score when it changes
  useEffect(() => {
    if (currentScore > prevScore.current) {
      controls.start({
        scale: [1, 1.2, 1],
        color: ['#FFFFFF', '#FFDE00', '#FFFFFF'],
        transition: { duration: 0.5 }
      });
    }
    prevScore.current = currentScore;
  }, [currentScore, controls]);
  
  return (
    <motion.div 
      className="bg-gray-800 rounded-lg p-4 text-white flex flex-col gap-2 w-64"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between">
        <span className="text-gray-300">Current Score:</span>
        <motion.span 
          className="font-bold text-lg"
          animate={controls}
        >
          {currentScore}
        </motion.span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-300">High Score:</span>
        <span className="font-bold text-lg">{highScore}</span>
      </div>
      
      {/* Score milestones */}
      {/*<div className="mt-4 space-y-2">
        <h3 className="text-xs uppercase text-gray-400">Unlocks:</h3>
        
        <div className="flex justify-between text-xs">
          <span>Zero Card</span>
          <div className={`w-3 h-3 rounded-full ${currentScore >= 100 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span>Negative Numbers</span>
          <div className={`w-3 h-3 rounded-full ${currentScore >= 500 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span>Functions</span>
          <div className={`w-3 h-3 rounded-full ${currentScore >= 1000 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span>Constants (π, e)</span>
          <div className={`w-3 h-3 rounded-full ${currentScore >= 10000 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span>Variable (x)</span>
          <div className={`w-3 h-3 rounded-full ${currentScore >= 10000 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
      </div>*/}
    </motion.div>
  );
}
