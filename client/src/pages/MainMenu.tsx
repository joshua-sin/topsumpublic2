
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAudio } from '@/lib/stores/useAudio';
import { useGameHistory } from '@/lib/stores/useGameHistory';
import { GAME_VERSION } from '@/lib/constants';
import { History, Trophy, Clock, Target, X, Menu, Plus, Minus, Divide, Multiply } from 'lucide-react';


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

export function MainMenu() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { setHitSound, setSuccessSound, toggleMute, isMuted } = useAudio();
  const { getRecentSessions, getTotalGamesPlayed, getHighestScore } = useGameHistory();
  
  const recentSessions = getRecentSessions(5);
  const totalGames = getTotalGamesPlayed();
  const highestScore = getHighestScore();

  // Floating cards data
  const floatingCards = [
    { type: 'number', value: '7' },
    { type: 'number', value: '3' },
    { type: 'number', value: '9' },
    { type: 'operator', value: '+' },
    { type: 'operator', value: '-' },
    { type: 'operator', value: '×' },
    { type: 'operator', value: '÷' },
    { type: 'function', value: 'x²' },
    { type: 'function', value: '√' },
    { type: 'constant', value: 'π' },
    { type: 'number', value: '5' },
    { type: 'number', value: '2' }
  ];
  
  // Load and set up audio
  useEffect(() => {
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');
    
    setHitSound(hitSound);
    setSuccessSound(successSound);
    
    setLoaded(true);
  }, [setHitSound, setSuccessSound]);
  
  const handlePlayClick = (mode: 'solo' | 'vs_bot' | 'vs_player') => {
    navigate('/difficulty', { state: { mode } });
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-500';
      case 'decimals': return 'bg-blue-500';
      case 'negative': return 'bg-purple-500';
      case 'functions': return 'bg-orange-500';
      case 'algebra': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated floating cards background */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingCards.map((card, index) => (
          <FloatingCard
            key={`${card.type}-${card.value}-${index}`}
            type={card.type}
            value={card.value}
            delay={index * 0.5}
          />
        ))}
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              className="fixed left-0 top-0 h-full w-80 bg-gray-800/95 backdrop-blur-sm z-50 p-6 overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <History className="w-6 h-6" />
                  Game History
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                  className="text-white hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {totalGames > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">{totalGames}</div>
                      <div className="text-gray-300 text-sm">Games Played</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">{highestScore.toLocaleString()}</div>
                      <div className="text-gray-300 text-sm">High Score</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Recent Games</h3>
                    {recentSessions.map((session) => (
                      <div key={session.id} className="bg-gray-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getDifficultyColor(session.difficulty)} text-white text-xs`}>
                            {session.difficulty}
                          </Badge>
                          <span className="text-gray-300 text-xs">
                            {formatDate(session.date)}
                          </span>
                        </div>
                        <div className="text-white font-bold text-lg">
                          {session.score.toLocaleString()} points
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => {
                        setShowSidebar(false);
                        navigate('/history');
                      }}
                    >
                      View Full History
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 mt-8">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No games played yet!</p>
                  <p className="text-sm">Start playing to see your history here.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* History Toggle Button */}
        {totalGames > 0 && (
          <Button
            className="fixed top-4 left-4 z-30 bg-purple-600/80 hover:bg-purple-700/80 backdrop-blur-sm"
            size="sm"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="w-4 h-4 mr-2" />
            History ({totalGames})
          </Button>
        )}

        <motion.div 
          className="max-w-lg w-full"
          variants={containerVariants}
          initial="hidden"
          animate={loaded ? "visible" : "hidden"}
        >
          {/* Logo Section */}
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3
              }}
              className="inline-block"
            >
              <a href = "https://top-sum.webflow.io/"><img 
                src="./images/TOP.png" 
                alt="Top Sum Logo"
                className="w-48 h-auto mx-auto drop-shadow-2xl"
              /></a>
              
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              className="mt-4"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white text-lg font-medium">
                  🎯 Combine cards to achieve the highest score!
                </p>
                <p className="text-purple-200 text-sm mt-2">
                  Top Sum {GAME_VERSION} ✨
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Game Mode Buttons */}
          <motion.div 
            className="space-y-4"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xl font-bold shadow-lg border-2 border-white/20"
                onClick={() => handlePlayClick('solo')}
              >
                🎮 Solo Mode
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
            >
              <Button 
                size="lg" 
                className="w-full h-16 bg-gradient-to-r from-green-500 to-teal-600 opacity-60 text-xl font-bold shadow-lg border-2 border-white/20"
                disabled
              >
                🤖 VS Bot Mode - Coming Soon!
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
            >
              <Button 
                size="lg" 
                className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-600 opacity-60 text-xl font-bold shadow-lg border-2 border-white/20"
                disabled
              >
                👥 VS Player Mode - Coming Soon!
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Sound Toggle */}
          <motion.div 
            className="mt-8 text-center"
            variants={itemVariants}
          >
            <Button
              variant="outline"
              className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? "🔇 Unmute Sound" : "🔊 Mute Sound"}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default MainMenu;
