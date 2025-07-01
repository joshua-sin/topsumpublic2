import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Hand } from './Hand';
import { GrindDeck } from './GrindDeck';
import { AlgebraDeck } from './AlgebraDeck';
import { DeckSelector } from './DeckSelector';
import { ApplyFunctionButton } from './ApplyFunctionButton';
import { Deck } from './Deck';
import { ScoreDisplay } from './ScoreDisplay';
import { useCardGame } from '@/lib/stores/useCardGame';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { SoloGameTimer } from './SoloGameTimer';
import { SoloGameStats } from './SoloGameStats';

interface GameBoardProps {
  soloGameConfig?: {
    soloGameMode?: string;
    timeLimit?: number;
    deckLimit?: number;
    targetScore?: number;
    gameConfig?: any;
    onTimeUp?: () => void;
  };
}

export function GameBoard({ soloGameConfig = {} }: GameBoardProps) {
  const navigate = useNavigate();
  const {
    player,
    deckPool,
    difficulty,
    drawCard,
    resetWithSameDifficulty
  } = useCardGame();
  
  // Extract player properties with fallbacks for compatibility
  const hand = player?.hand || [];
  const deck = deckPool || [];
  const grindDeck = player?.grindDeck || [];
  const grindDeckValue = player?.grindDeckValue || 0;
  const currentScore = player?.currentScore || 0;
  const algebraDeck = player?.algebraDeck || [];
  const algebraFunction = player?.algebraFunction || 'x';
  const hasActiveAlgebraDeck = player?.hasActiveAlgebraDeck || false;
  
  const { playHit, playSuccess } = useAudio();
  
  // Sound effects on score changes
  useEffect(() => {
    if (currentScore > 0) {
      playHit();
    }
    
    // Play success sound on milestone achievements
    if (currentScore === 100 || currentScore === 500 || 
        currentScore === 1000 || currentScore === 10000) {
      playSuccess();
    }
  }, [currentScore, playHit, playSuccess]);
  
  const handleExit = () => {
    navigate('/');
  };
  
  const handleReset = () => {
    resetWithSameDifficulty();
  };
  
  // Format difficulty name for display
  const formatDifficulty = (diff: string): string => {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-200 flex flex-col p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Top Sum - {formatDifficulty(difficulty)}
          </motion.h1>
          
          {soloGameConfig?.soloGameMode && (
            <SoloGameStats 
              soloGameMode={soloGameConfig.soloGameMode as any}
              timeLimit={soloGameConfig.timeLimit}
              deckLimit={soloGameConfig.deckLimit}
              targetScore={soloGameConfig.targetScore}
            />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {soloGameConfig?.soloGameMode === 'time_limited' && soloGameConfig.timeLimit && soloGameConfig.onTimeUp && (
            <SoloGameTimer 
              timeLimit={soloGameConfig.timeLimit} 
              onTimeUp={soloGameConfig.onTimeUp}
            />
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Reset
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExit}
            >
              Exit
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <ScoreDisplay />
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Deck 
              cardCount={deck.length} 
              onDraw={drawCard}
              soloGameMode={soloGameConfig?.soloGameMode}
              remainingCards={soloGameConfig?.soloGameMode === 'deck_limited' ? 
                Math.max(0, (soloGameConfig.deckLimit || 0) - (useCardGame.getState().cardsPlayed || 0)) : 
                undefined}
            />

            <div className="text-sm text-gray-500">
              <a href = "https://top-sum.webflow.io//how-to-play">How to play?</a>
            </div>
          </motion.div>
        </div>
        
        {/* Center game area with decks */}
        <div className="flex-1 flex items-center justify-center my-8">
          <div className="flex flex-col gap-6 items-center">
            {/* Decks area */}
            <div className="flex items-center justify-center gap-10 relative">
              {/* Grind Deck */}
              <GrindDeck cards={grindDeck} value={grindDeckValue} />
              
              {/* Algebra Deck (when active) */}
              <AnimatePresence>
                {hasActiveAlgebraDeck && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <AlgebraDeck 
                      cards={algebraDeck} 
                      algebraFunction={algebraFunction} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Deck Selector */}
            <AnimatePresence>
              {hasActiveAlgebraDeck && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex flex-col gap-4 items-center"
                >
                  <DeckSelector />
                  <ApplyFunctionButton />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Hand area */}
        <div className="mt-auto">
          {hand && hand.length > 0 ? (
            <Hand cards={hand} />
          ) : (
            <div className="text-center text-gray-500 p-4">
              Loading cards...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
