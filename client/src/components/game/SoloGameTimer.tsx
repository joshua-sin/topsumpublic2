import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCardGame } from '../../lib/stores/useCardGame';

interface SoloGameTimerProps {
  timeLimit: number; // in seconds
  onTimeUp?: () => void;
}

export function SoloGameTimer({ timeLimit, onTimeUp }: SoloGameTimerProps) {
  const getRemainingTime = useCardGame(state => state.getRemainingTime);
  const checkGameEndConditions = useCardGame(state => state.checkGameEndConditions);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getRemainingTime();
      if (remaining !== null) {
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          onTimeUp?.();
        }
      }
      
      // Check for end conditions on each tick
      checkGameEndConditions();
    }, 1000);

    return () => clearInterval(timer);
  }, [getRemainingTime, checkGameEndConditions, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    const percentage = timeRemaining / timeLimit;
    if (percentage > 0.5) return 'text-green-400';
    if (percentage > 0.25) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div 
      className="bg-gray-700 rounded-lg p-3 min-w-[120px]"
      animate={{ 
        scale: timeRemaining <= 10 && timeRemaining > 0 ? [1, 1.05, 1] : 1 
      }}
      transition={{ 
        duration: 0.5, 
        repeat: timeRemaining <= 10 && timeRemaining > 0 ? Infinity : 0 
      }}
    >
      <div className="text-gray-300 text-sm font-medium">Time Left</div>
      <div className={`text-xl font-bold ${getTimerColor()}`}>
        {formatTime(timeRemaining)}
      </div>
    </motion.div>
  );
}