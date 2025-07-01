import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { SoloGameTimer } from '@/components/game/SoloGameTimer';
import { SoloGameStats } from '@/components/game/SoloGameStats';
import { useCardGame } from '@/lib/stores/useCardGame';

interface LocationState {
  difficulty?: string;
  gameMode?: string;
  soloGameMode?: string;
  timeLimit?: number;
  deckLimit?: number;
  targetScore?: number;
}

export function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const startGame = useCardGame(state => state.startGame);
  const endGame = useCardGame(state => state.endGame);
  const difficulty = useCardGame(state => state.difficulty);
  const player = useCardGame(state => state.player);
  const isGameEnded = useCardGame(state => state.isGameEnded);
  const gameEndReason = useCardGame(state => state.gameEndReason);
  const gameStartTime = useCardGame(state => state.gameStartTime);
  const cardsPlayed = useCardGame(state => state.cardsPlayed);
  const [gameConfig, setGameConfig] = useState<LocationState | null>(null);

  // Handle game ending and navigation to results
  useEffect(() => {
    if (isGameEnded && gameConfig) {
      const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
      const moves = useCardGame.getState().moves || [];
      navigate('/results', {
        state: {
          score: player?.currentScore || 0,
          difficulty: difficulty,
          soloGameMode: gameConfig.soloGameMode,
          timeLimit: gameConfig.timeLimit,
          deckLimit: gameConfig.deckLimit,
          targetScore: gameConfig.targetScore,
          timeTaken: timeTaken,
          cardsPlayed: cardsPlayed || 0,
          gameEndReason: gameEndReason || 'time_up',
          moves: moves
        }
      });
    }
  }, [isGameEnded, gameConfig, navigate, player?.currentScore, difficulty, gameStartTime, cardsPlayed, gameEndReason]);

  // Handle time up for time-limited mode
  const handleTimeUp = () => {
    endGame('time_up');
  };
  
  // Initialize the game with the configuration from navigation state
  useEffect(() => {
    const config = location.state as LocationState;
    if (config && config.difficulty) {
      setGameConfig(config);
      startGame(
        config.difficulty as any,
        config.gameMode,
        'unlimited',
        undefined,
        config.soloGameMode as any,
        config.timeLimit,
        config.deckLimit,
        config.targetScore
      );
    } else if (!difficulty) {
      // If no configuration and no existing game, redirect to difficulty selection
      navigate('/difficulty');
    }
  }, [location.state, startGame, difficulty, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-200 overflow-hidden flex flex-col">
      <GameBoard 
        soloGameConfig={gameConfig ? {
          soloGameMode: gameConfig.soloGameMode,
          timeLimit: gameConfig.timeLimit,
          deckLimit: gameConfig.deckLimit,
          targetScore: gameConfig.targetScore,
          gameConfig: gameConfig,
          onTimeUp: handleTimeUp
        } : undefined} 
      />
    </div>
  );
}

export default Game;
