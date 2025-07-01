
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameHistory, GameSession } from '@/lib/stores/useGameHistory';
import { Replay } from '@/components/game/Replay';
import { ArrowLeft, Play, Clock, Trophy, Target, Calendar } from 'lucide-react';

export function GameHistory() {
  const navigate = useNavigate();
  const { sessions, getTotalGamesPlayed, getTotalTimePlayed, getHighestScore, clearHistory } = useGameHistory();
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [showReplay, setShowReplay] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getSoloGameModeDisplay = (mode?: string) => {
    switch (mode) {
      case 'time_limited': return 'Time Limited';
      case 'deck_limited': return 'Deck Limited';
      case 'reach_score': return 'Score Target';
      case 'unlimited': return 'Unlimited';
      default: return 'Standard';
    }
  };

  const handleReplay = (session: GameSession) => {
    setSelectedSession(session);
    setShowReplay(true);
  };

  if (showReplay && selectedSession) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setShowReplay(false)}
              className="text-white border-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Replay: {formatDate(selectedSession.date)}
            </h1>
          </div>
          <Replay moves={selectedSession.moves} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="text-white border-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-3xl font-bold text-white">Game History</h1>
          </div>
          {sessions.length > 0 && (
            <Button
              variant="destructive"
              onClick={clearHistory}
              className="text-sm"
            >
              Clear History
            </Button>
          )}
        </div>

        {sessions.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center text-gray-400">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Games Played Yet</h3>
                <p className="mb-4">Start playing to build your game history!</p>
                <Button onClick={() => navigate('/')}>
                  Play Your First Game
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-800 text-white">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">All Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Total Games
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {getTotalGamesPlayed()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Total Time Played
                    </CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatTime(getTotalTimePlayed())}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Highest Score
                    </CardTitle>
                    <Target className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {getHighestScore().toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getDifficultyColor(session.difficulty)} text-white`}>
                            {session.difficulty}
                          </Badge>
                          <div>
                            <div className="text-white font-medium">
                              Score: {session.score.toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {getSoloGameModeDisplay(session.soloGameMode)} • {formatTime(session.timePlayed)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">
                            {formatDate(session.date)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReplay(session)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Replay
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge className={`${getDifficultyColor(session.difficulty)} text-white`}>
                            {session.difficulty}
                          </Badge>
                          <div>
                            <div className="text-white font-bold text-lg">
                              Score: {session.score.toLocaleString()}
                            </div>
                            <div className="text-gray-400">
                              {getSoloGameModeDisplay(session.soloGameMode)} • {session.cardsPlayed} cards • {formatTime(session.timePlayed)}
                            </div>
                            {session.timeLimit && (
                              <div className="text-gray-500 text-sm">
                                Time Limit: {session.timeLimit}s
                              </div>
                            )}
                            {session.targetScore && (
                              <div className="text-gray-500 text-sm">
                                Target Score: {session.targetScore.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-gray-400 text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(session.date)}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {session.moves.length} moves
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleReplay(session)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Replay
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default GameHistory;
