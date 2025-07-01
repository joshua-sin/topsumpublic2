import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Hash, Target, Infinity } from 'lucide-react';
import { SoloGameMode, Difficulty } from '@/types/card';

interface LocationState {
  difficulty: Difficulty;
}

// Floating card component
function FloatingCard({ type, value, delay }: { type: string, value: string, delay: number }) {
  const cardColors = {
    number: 'bg-blue-500',
    operator: 'bg-red-500',
    function: 'bg-green-500',
    constant: 'bg-yellow-500'
  };

  const initialX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 64 : 800);
  const targetX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 64 : 800);

  return (
    <motion.div
      className={`absolute w-16 h-24 rounded-lg border-2 border-white shadow-lg flex items-center justify-center font-bold text-lg ${cardColors[type as keyof typeof cardColors] || 'bg-gray-500'} ${type === 'constant' ? 'text-black' : 'text-white'}`}
      initial={{ 
        x: initialX,
        y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 100,
        rotate: 0
      }}
      animate={{
        y: -100,
        rotate: 360,
        x: targetX
      }}
      transition={{
        duration: 12 + Math.random() * 6,
        delay: delay,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: Math.random() * 2
      }}
    >
      {value}
    </motion.div>
  );
}

export function SoloModeSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { difficulty } = (location.state as LocationState) || { difficulty: 'basic' };

  const [selectedMode, setSelectedMode] = useState<SoloGameMode | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(300); // 5 minutes default
  const [deckLimit, setDeckLimit] = useState<number>(50); // 50 cards default
  const [targetScore, setTargetScore] = useState<number>(1000); // 1000 points default

    // Floating cards data
    const floatingCards = [
      { type: 'number', value: '1' },
      { type: 'number', value: '10' },
      { type: 'operator', value: '-' },
      { type: 'operator', value: '÷' },
      { type: 'function', value: 'sin' },
      { type: 'constant', value: 'e' },
      { type: 'number', value: '0' },
      { type: 'function', value: 'log' }
    ];

  const gameModes = [
    {
      key: 'unlimited' as SoloGameMode,
      name: 'Unlimited',
      description: 'Play endlessly with no restrictions',
      icon: Infinity,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      key: 'time_limited' as SoloGameMode,
      name: 'Time Limited',
      description: 'Race against the clock to get the highest score',
      icon: Clock,
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      key: 'deck_limited' as SoloGameMode,
      name: 'Deck Limited',
      description: 'Limited number of cards to play',
      icon: Hash,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      key: 'reach_score' as SoloGameMode,
      name: 'Reach Score',
      description: 'Try to reach target score as quickly as possible',
      icon: Target,
      color: 'bg-purple-600 hover:bg-purple-700',
    }
  ];

  const handleModeSelect = (mode: SoloGameMode) => {
    setSelectedMode(mode);
    if (mode === 'unlimited') {
      // For unlimited mode, go directly to game
      navigate('/game', { 
        state: { 
          difficulty, 
          gameMode: 'solo',
          soloGameMode: mode 
        } 
      });
    } else {
      // For other modes, show configuration dialog
      setShowConfigDialog(true);
    }
  };

  const handleStartGame = () => {
    if (!selectedMode) return;

    const gameConfig = {
      difficulty,
      gameMode: 'solo' as const,
      soloGameMode: selectedMode,
      ...(selectedMode === 'time_limited' && { timeLimit }),
      ...(selectedMode === 'deck_limited' && { deckLimit }),
      ...(selectedMode === 'reach_score' && { targetScore }),
    };

    navigate('/game', { state: gameConfig });
  };

  const handleBack = () => {
    navigate('/difficulty');
  };

  const getPresetButtons = () => {
    switch (selectedMode) {
      case 'time_limited':
        return [
          { label: '1 min', value: 60 },
          { label: '5 min', value: 300 },
          { label: '10 min', value: 600 },
          { label: '15 min', value: 900 },
        ].map(preset => (
          <Button
            key={preset.value}
            variant={timeLimit === preset.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeLimit(preset.value)}
            className = ""
          >
            {preset.label}
          </Button>
        ));
      case 'deck_limited':
        return [
          { label: '25 cards', value: 25 },
          { label: '50 cards', value: 50 },
          { label: '100 cards', value: 100 },
          { label: '200 cards', value: 200 },
        ].map(preset => (
          <Button
            key={preset.value}
            variant={deckLimit === preset.value ? "default" : "outline"}
            size="sm"
            onClick={() => setDeckLimit(preset.value)}
          >
            {preset.label}
          </Button>
        ));
      case 'reach_score':
        return [
          { label: '500 pts', value: 500 },
          { label: '1000 pts', value: 1000 },
          { label: '2500 pts', value: 2500 },
          { label: '5000 pts', value: 5000 },
        ].map(preset => (
          <Button
            key={preset.value}
            variant={targetScore === preset.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTargetScore(preset.value)}
          >
            {preset.label}
          </Button>
        ));
      default:
        return null;
    }
  };

  const getCurrentValue = () => {
    switch (selectedMode) {
      case 'time_limited':
        return timeLimit;
      case 'deck_limited':
        return deckLimit;
      case 'reach_score':
        return targetScore;
      default:
        return 0;
    }
  };

  const handleValueChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    switch (selectedMode) {
      case 'time_limited':
        setTimeLimit(Math.max(10, numValue)); // minimum 10 seconds
        break;
      case 'deck_limited':
        setDeckLimit(Math.max(1, numValue)); // minimum 1 card
        break;
      case 'reach_score':
        setTargetScore(Math.max(100, numValue)); // minimum 100 points
        break;
    }
  };

  const getValueLabel = () => {
    switch (selectedMode) {
      case 'time_limited':
        return 'Time (seconds)';
      case 'deck_limited':
        return 'Number of cards';
      case 'reach_score':
        return 'Target score';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start p-4 overflow-auto">
          {/* Animated floating cards background */}
          <div className="absolute inset-0 pointer-events-none">
        {floatingCards.map((card, index) => (
          <FloatingCard
            key={`${card.type}-${card.value}-${index}`}
            type={card.type}
            value={card.value}
            delay={index * 0.8}
          />
        ))}
      </div>
      <motion.div 
        className="max-w-4xl w-full my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-2 text-gray-400 text-center">
          Solo Mode • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
        </div>

        <motion.h1 
          className="text-3xl font-bold text-center text-white mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Choose Your Challenge
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {gameModes.map((mode, index) => {
            const IconComponent = mode.icon;
            return (
              <motion.div
                key={mode.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-gray-600 bg-gray-800"
                  onClick={() => handleModeSelect(mode.key)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-full ${mode.color} flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{mode.name}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {mode.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="text-white border-white"
          >
            Back to Difficulty
          </Button>
        </motion.div>
      </motion.div>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">
              Configure {selectedMode?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Mode
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Choose your settings for this game mode.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="value" className="text-white">
                {getValueLabel()}
              </Label>
              <Input
                id="value"
                type="number"
                value={getCurrentValue()}
                onChange={(e) => handleValueChange(e.target.value)}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">Quick Select</Label>
              <div className="flex gap-2 flex-wrap text-white">
                {getPresetButtons()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowConfigDialog(false)}
                className="text-white border-gray-600"
              >
                Cancel
              </Button>
              <Button onClick={handleStartGame} className="text-white border-green-700">
                Start Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SoloModeSelect;