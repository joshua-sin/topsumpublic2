
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Difficulty, SoloGameMode, Move } from '@/types/card';

export interface GameSession {
  id: string;
  date: number; // timestamp
  difficulty: Difficulty;
  gameMode: 'solo' | 'vs_bot' | 'vs_player';
  soloGameMode?: SoloGameMode;
  score: number;
  timePlayed: number; // in seconds
  cardsPlayed: number;
  moves: Move[];
  gameEndReason: 'time_up' | 'deck_finished' | 'score_reached' | 'manual_end';
  timeLimit?: number;
  deckLimit?: number;
  targetScore?: number;
}

interface GameHistoryState {
  sessions: GameSession[];
  addSession: (session: Omit<GameSession, 'id'>) => void;
  addGame: (gameData: any) => void;
  getRecentSessions: (count: number) => GameSession[];
  getTotalGamesPlayed: () => number;
  getTotalTimePlayed: () => number; // in seconds
  getHighestScore: () => number;
  clearHistory: () => void;
}

export const useGameHistory = create<GameHistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],
      
      addSession: (sessionData) => {
        const session: GameSession = {
          ...sessionData,
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 100) // Keep only last 100 sessions
        }));
      },

      addGame: (gameData) => {
        const session: GameSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: Date.now(),
          gameMode: 'solo',
          timePlayed: gameData.timeTaken || 0,
          cardsPlayed: gameData.cardsPlayed || 0,
          moves: gameData.moves || [],
          difficulty: gameData.difficulty,
          soloGameMode: gameData.soloGameMode,
          score: gameData.score,
          gameEndReason: gameData.gameEndReason,
          timeLimit: gameData.timeLimit,
          deckLimit: gameData.deckLimit,
          targetScore: gameData.targetScore
        };
        
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 100) // Keep only last 100 sessions
        }));
      },
      
      getRecentSessions: (count) => {
        return get().sessions.slice(0, count);
      },
      
      getTotalGamesPlayed: () => {
        return get().sessions.length;
      },
      
      getTotalTimePlayed: () => {
        return get().sessions.reduce((total, session) => total + session.timePlayed, 0);
      },
      
      getHighestScore: () => {
        const sessions = get().sessions;
        return sessions.length > 0 ? Math.max(...sessions.map(s => s.score)) : 0;
      },
      
      clearHistory: () => {
        set({ sessions: [] });
      }
    }),
    {
      name: 'game-history-storage'
    }
  )
);
