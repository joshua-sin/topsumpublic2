import React from 'react';
import { motion } from 'framer-motion';
import { SoloGameMode } from '@/types/card';

interface SoloGameStatsProps {
  soloGameMode: SoloGameMode;
  timeLimit?: number;
  deckLimit?: number;
  targetScore?: number;
}

export function SoloGameStats({ soloGameMode, timeLimit, deckLimit, targetScore }: SoloGameStatsProps) {
  const getModeName = (mode: SoloGameMode): string => {
    switch (mode) {
      case 'unlimited':
        return 'Unlimited Mode';
      case 'time_limited':
        return 'Time Challenge';
      case 'deck_limited':
        return 'Card Challenge';
      case 'reach_score':
        return 'Score Challenge';
      default:
        return 'Solo Mode';
    }
  };

  const getModeDescription = (): string => {
    switch (soloGameMode) {
      case 'unlimited':
        return 'Play without restrictions';
      case 'time_limited':
        return `Reach the highest score in ${timeLimit}s`;
      case 'deck_limited':
        return `Use only ${deckLimit} cards wisely`;
      case 'reach_score':
        return `Reach ${targetScore} points as quickly as possible`;
      default:
        return '';
    }
  };

  const getGameGoal = (): { label: string; value: string } | null => {
    switch (soloGameMode) {
      case 'time_limited':
        return { label: 'Time Limit', value: `${timeLimit}s` };
      case 'deck_limited':
        return { label: 'Card Limit', value: `${deckLimit} cards` };
      case 'reach_score':
        return { label: 'Target Score', value: `${targetScore} points` };
      default:
        return null;
    }
  };

  const goal = getGameGoal();

  return (
    <motion.div 
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-700 rounded-lg p-3">
        <div className="text-gray-300 text-sm font-medium">Game Mode</div>
        <div className="text-white text-lg font-bold">{getModeName(soloGameMode)}</div>
        <div className="text-gray-400 text-xs">{getModeDescription()}</div>
      </div>
      
      {goal && (
        <div className="bg-blue-600 rounded-lg p-3 min-w-[100px]">
          <div className="text-blue-100 text-sm font-medium">{goal.label}</div>
          <div className="text-white text-lg font-bold">{goal.value}</div>
        </div>
      )}
    </motion.div>
  );
}