
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { Move } from '@/types/card';

interface ReplayProps {
  moves: Move[];
  onClose: () => void;
}

export function Replay({ moves, onClose }: ReplayProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // milliseconds

  React.useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentMoveIndex(prev => {
        if (prev >= moves.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, moves.length]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  };
  const handleNext = () => {
    if (currentMoveIndex < moves.length - 1) {
      setCurrentMoveIndex(prev => prev + 1);
    }
  };
  const handlePrevious = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(prev => prev - 1);
    }
  };

  const formatTimestamp = (timestamp: number, startTime: number) => {
    const elapsed = Math.floor((timestamp - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCardDisplay = (card: any) => {
    if (card.type === 'number' || card.type === 'zero' || card.type === 'negative') {
      return card.value.toString();
    } else if (card.type === 'arithmetic') {
      return card.operator;
    } else if (card.type === 'function') {
      return card.operator;
    } else if (card.type === 'constant') {
      return card.value;
    } else if (card.type === 'variable') {
      return card.symbol || 'x';
    }
    return '?';
  };

  const getCardColor = (card: any) => {
    switch (card.type) {
      case 'number':
        return 'bg-blue-500 text-white';
      case 'zero':
        return 'bg-blue-700 text-white';
      case 'arithmetic':
        return 'bg-red-500 text-white';
      case 'negative':
        return 'bg-purple-500 text-white';
      case 'function':
        return 'bg-green-500 text-white';
      case 'constant':
        return 'bg-yellow-500 text-black';
      case 'variable':
        return 'bg-black text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (moves.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="bg-white max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Game Replay
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">No moves to replay!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startTime = moves[0]?.timestamp || 0;
  const currentMove = moves[currentMoveIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white max-w-4xl w-full max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            Game Replay ({currentMoveIndex + 1} / {moves.length})
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto">
          {/* Current Move Display */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMoveIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">
                    Move {currentMoveIndex + 1}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(currentMove.timestamp, startTime)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  {currentMove.cards.map((card, index) => (
                    <motion.div
                      key={`${card.id}-${index}`}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${getCardColor(card)}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {getCardDisplay(card)}
                    </motion.div>
                  ))}
                </div>
                
                <p className="text-lg font-semibold text-gray-800">
                  {currentMove.description}
                </p>
                
                {currentMove.resultValue !== undefined && (
                  <p className="text-sm text-gray-600 mt-2">
                    Result: {currentMove.resultValue.toLocaleString()}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Move List */}
          <div className="max-h-64 overflow-y-auto">
            <h3 className="font-semibold mb-2">All Moves:</h3>
            <div className="space-y-2">
              {moves.map((move, index) => (
                <div
                  key={move.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    index === currentMoveIndex
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentMoveIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {index + 1}. {move.description}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(move.timestamp, startTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        {/* Controls */}
        <div className="flex-shrink-0 border-t p-4">
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button onClick={handlePlay} className="px-6">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleNext}>
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setCurrentMoveIndex(moves.length - 1)}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4">
            <label className="text-sm">Playback Speed:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}
