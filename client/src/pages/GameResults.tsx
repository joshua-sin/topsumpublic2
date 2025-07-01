import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCardGame } from '@/lib/stores/useCardGame';
import { useGameHistory } from '@/lib/stores/useGameHistory';
import { Difficulty, SoloGameMode, Move } from '@/types/card';
import { Replay } from '@/components/game/Replay';
import { Trophy, Clock, Target, Play, Home, RotateCcw, ArrowLeft, Hash } from 'lucide-react';

interface LocationState {
  score: number;
  difficulty: Difficulty;
  soloGameMode: SoloGameMode;
  timeLimit?: number;
  deckLimit?: number;
  targetScore?: number;
  timeTaken?: number; // in seconds
  cardsPlayed?: number;
  gameEndReason: 'time_up' | 'deck_finished' | 'score_reached';
  moves?: Move[];
}

export function GameResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetGame = useCardGame(state => state.resetGame);
  const [showReplay, setShowReplay] = useState(false);
  const addGame = useGameHistory(state => state.addGame);

  const {
    score,
    difficulty,
    soloGameMode,
    timeLimit,
    deckLimit,
    targetScore,
    timeTaken,
    cardsPlayed,
    gameEndReason,
    moves
  } = (location.state as LocationState) || {};

  useEffect(() => {
    // Save the game session to history
    if (location.state) {
      const gameSession = {
        score,
        difficulty,
        soloGameMode,
        timeLimit,
        deckLimit,
        targetScore,
        timeTaken,
        cardsPlayed,
        gameEndReason,
        moves,
        timestamp: new Date(),
      };
      addGame(gameSession);
    }
  }, [location.state, addGame, score, difficulty, soloGameMode, timeLimit, deckLimit, targetScore, timeTaken, cardsPlayed, gameEndReason, moves]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGameModeTitle = () => {
    switch (soloGameMode) {
      case 'time_limited':
        return 'Time Limited Challenge';
      case 'deck_limited':
        return 'Deck Limited Challenge';
      case 'reach_score':
        return 'Score Challenge';
      default:
        return 'Game Complete';
    }
  };

  const getEndReasonMessage = () => {
    switch (gameEndReason) {
      case 'time_up':
        return 'Time\'s up!';
      case 'deck_finished':
        return 'All cards played!';
      case 'score_reached':
        return 'Target reached!';
      default:
        return 'Game finished!';
    }
  };

  const getResultColor = () => {
    switch (gameEndReason) {
      case 'score_reached':
        return 'text-green-400';
      case 'time_up':
        return 'text-orange-400';
      case 'deck_finished':
        return 'text-blue-400';
      default:
        return 'text-white';
    }
  };

  const handlePlayAgain = () => {
    const gameConfig = {
      difficulty,
      gameMode: 'solo' as const,
      soloGameMode,
      ...(soloGameMode === 'time_limited' && { timeLimit }),
      ...(soloGameMode === 'deck_limited' && { deckLimit }),
      ...(soloGameMode === 'reach_score' && { targetScore }),
    };

    resetGame();
    navigate('/game', { state: gameConfig });
  };

  const handleChangeDifficulty = () => {
    resetGame();
    navigate('/solo-mode', { state: { difficulty } });
  };

  const handleMainMenu = () => {
    resetGame();
    navigate('/');
  };

  const stats = [
    {
      icon: Trophy,
      label: 'Final Score',
      value: score?.toLocaleString() || '0',
      color: 'text-yellow-400'
    },
    ...(timeTaken ? [{
      icon: Clock,
      label: 'Time Taken',
      value: formatTime(timeTaken),
      color: 'text-blue-400'
    }] : []),
    ...(cardsPlayed ? [{
      icon: Hash,
      label: 'Cards Played',
      value: cardsPlayed.toString(),
      color: 'text-green-400'
    }] : []),
  ];

  const targets = [];
  if (timeLimit && soloGameMode === 'time_limited') {
    targets.push({
      label: 'Time Limit',
      value: formatTime(timeLimit),
      achieved: (timeTaken || 0) <= timeLimit
    });
  }
  if (deckLimit && soloGameMode === 'deck_limited') {
    targets.push({
      label: 'Deck Size',
      value: `${deckLimit} cards`,
      achieved: (cardsPlayed || 0) >= deckLimit
    });
  }
  if (targetScore && soloGameMode === 'reach_score') {
    targets.push({
      label: 'Target Score',
      value: targetScore.toLocaleString(),
      achieved: (score || 0) >= targetScore
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-auto">
      <motion.div 
        className="max-w-2xl w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-800 border-gray-600 text-center">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="mx-auto mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <CardTitle className="text-3xl text-white mb-2">
              {getGameModeTitle()}
            </CardTitle>

            <div className={`text-xl font-semibold ${getResultColor()}`}>
              {getEndReasonMessage()}
            </div>

            <Badge variant="outline" className="mt-2 text-gray-300 border-gray-500">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Targets (if any) */}
            {targets.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Challenge Targets</h3>
                <div className="space-y-2">
                  {targets.map((target, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{target.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{target.value}</span>
                        <div className={`w-3 h-3 rounded-full ${
                          target.achieved ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col gap-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* First row - Replay button */}
              {moves && moves.length > 0 && (
                <Button 
                  onClick={() => setShowReplay(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Replay
                </Button>
              )}

              {/* Second row - Other actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handlePlayAgain}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>

                <Button 
                  onClick={handleChangeDifficulty}
                  variant="outline"
                  className="flex-1 text-white border-gray-600"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Change Mode
                </Button>

                <Button 
                  onClick={handleMainMenu}
                  variant="outline"
                  className="flex-1 text-white border-gray-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Main Menu
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Replay Modal */}
      {showReplay && moves && (
        <Replay 
          moves={moves} 
          onClose={() => setShowReplay(false)} 
        />
      )}
    </div>
  );
}

export default GameResults;