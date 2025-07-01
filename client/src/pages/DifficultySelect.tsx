
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCardGame } from '@/lib/stores/useCardGame';
import { Difficulty, GameMode, GameLength } from '@/types/card';

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

export function DifficultySelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startGame } = useCardGame();

  // Get game mode from location state, default to solo
  const gameMode = (location.state?.mode || 'solo') as GameMode;

  // State for selected values
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('basic');
  const [selectedLength, setSelectedLength] = useState<GameLength>('medium');
  const [gameCode, setGameCode] = useState<string>('');
  const [step, setStep] = useState<'difficulty' | 'length' | 'code'>('difficulty');

  const difficulties: { key: Difficulty; name: string; description: string }[] = [
    {
      key: 'basic',
      name: '1. Basic Arithmetic',
      description: 'Simple addition, subtraction, multiplication, and division with whole numbers 1-9.'
    },
    {
      key: 'decimals',
      name: '2. Decimals and Fractions',
      description: 'Includes calculations resulting in decimal and fractional values.'
    },
    {
      key: 'negative',
      name: '3. Negative Numbers',
      description: 'Introduces negative numbers to the gameplay. Unlocks at score 500.'
    },
    {
      key: 'functions',
      name: '4. Functions',
      description: 'Advanced operations like square roots, trigonometry, and more. Unlocks at score 1000.'
    }
  ];

  const gameLengths: { key: GameLength; name: string; description: string }[] = [
    {
      key: 'short',
      name: 'Short Game',
      description: '100 cards total. Quick game for a short challenge.'
    },
    {
      key: 'medium',
      name: 'Medium Game',
      description: '500 cards total. Balanced gameplay length.'
    },
    {
      key: 'long',
      name: 'Long Game',
      description: '1000 cards total. Extended gameplay for serious competitors.'
    },
    {
      key: 'unlimited',
      name: 'Ultimate Mode',
      description: 'Unlimited cards. Play until you decide to stop.'
    }
  ];

  // Floating cards data
  const floatingCards = [
    { type: 'number', value: '4' },
    { type: 'number', value: '8' },
    { type: 'operator', value: '+' },
    { type: 'operator', value: '×' },
    { type: 'function', value: 'x²' },
    { type: 'constant', value: 'π' },
    { type: 'number', value: '6' },
    { type: 'function', value: '√' }
  ];

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);

    if (gameMode === 'solo') {
      // In solo mode, go to solo mode selection
      navigate('/solo-mode', { state: { difficulty } });
    } else {
      // In multiplayer modes, go to length selection
      setStep('length');
    }
  };

  const handleLengthSelect = (length: GameLength) => {
    setSelectedLength(length);

    if (gameMode === 'vs_bot') {
      // In VS Bot mode, start game right away
      startGame(selectedDifficulty, gameMode, length);
      navigate('/game');
    } else {
      // In VS Player mode, go to code entry/creation
      setStep('code');
    }
  };

  const handleCodeSubmit = () => {
    // Start game with VS Player mode and the entered/generated code
    startGame(selectedDifficulty, 'vs_player', selectedLength, gameCode);
    navigate('/game');
  };

  const generateRandomCode = () => {
    // Generate a random 6-character code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGameCode(result);
  };

  const handleBack = () => {
    if (step === 'difficulty') {
      navigate('/');
    } else if (step === 'length') {
      setStep('difficulty');
    } else {
      setStep('length');
    }
  };

  const renderTitle = () => {
    switch (step) {
      case 'difficulty':
        return 'Select Difficulty';
      case 'length':
        return 'Select Game Length';
      case 'code':
        return 'Game Code';
      default:
        return 'Game Setup';
    }
  };

  const renderDifficultyStep = () => (
    <div className="space-y-4 mb-8">
      {difficulties.map((difficulty, index) => (
        <motion.div
          key={difficulty.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * (index + 1) }}
        >
          <Card 
            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-gray-700"
            onClick={() => handleDifficultySelect(difficulty.key)}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold text-white">{difficulty.name}</h2>
              <p className="text-gray-300 mt-2">{difficulty.description}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderLengthStep = () => (
    <div className="space-y-4 mb-8">
      {gameLengths.map((length, index) => (
        <motion.div
          key={length.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * (index + 1) }}
        >
          <Card 
            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-gray-700"
            onClick={() => handleLengthSelect(length.key)}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold text-white">{length.name}</h2>
              <p className="text-gray-300 mt-2">{length.description}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderCodeStep = () => (
    <div className="space-y-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          {gameCode ? 'Game Code Generated!' : 'Create or Join a Game'}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="game-code" className="text-white mb-2 block">
              Game Code
            </Label>
            <div className="flex space-x-2">
              <Input
                id="game-code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="Enter code to join game"
                maxLength={6}
              />
              <Button 
                variant="outline" 
                onClick={generateRandomCode}
                className="whitespace-nowrap text-white border-white"
              >
                Generate Code
              </Button>
            </div>
          </div>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleCodeSubmit}
            disabled={!gameCode || gameCode.length < 6}
          >
            {gameCode ? 'Start Game' : 'Generate a Code First'}
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'difficulty':
        return renderDifficultyStep();
      case 'length':
        return renderLengthStep();
      case 'code':
        return renderCodeStep();
      default:
        return renderDifficultyStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 relative overflow-hidden flex flex-col items-center justify-start p-4">
      {/* Animated floating cards background */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingCards.map((card, index) => (
          <FloatingCard
            key={`${card.type}-${card.value}-${index}`}
            type={card.type}
            value={card.value}
            delay={index * 0.7}
          />
        ))}
      </div>
      
      <motion.div 
        className="max-w-xl w-full my-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="mb-2 text-gray-400 text-center">
          {gameMode === 'solo' ? 'Solo Mode' : gameMode === 'vs_bot' ? 'VS Bot Mode' : 'VS Player Mode'}
        </motion.div>

        <motion.h1 
          className="text-3xl font-bold text-center text-white mb-8"
          key={step} // Force animation to replay when step changes
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {renderTitle()}
        </motion.h1>

        {renderCurrentStep()}

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
            {step === 'difficulty' ? 'Back to Menu' : 'Back'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default DifficultySelect;
