// Card types and difficulty levels

export type CardType = 
  | 'number' 
  | 'arithmetic' 
  | 'zero' 
  | 'negative' 
  | 'function' 
  | 'constant' 
  | 'variable';

export type Difficulty = 
  | 'basic' 
  | 'decimals' 
  | 'negative' 
  | 'functions' 
  | 'algebra';

export type GameMode = 
  | 'solo'
  | 'vs_bot'
  | 'vs_player';

export type SoloGameMode = 
  | 'unlimited'
  | 'time_limited'
  | 'deck_limited'
  | 'reach_score';

export type GameLength = 
  | 'short'   // 100 cards
  | 'medium'  // 500 cards
  | 'long'    // 1000 cards
  | 'unlimited'; // No limit

export type ArithmeticOperator = '+' | '-' | '×' | '÷';

export type FunctionOperator = 
  | '√' 
  | '∛' 
  | 'sin' 
  | 'cos' 
  | 'tan' 
  | '1/x' 
  | 'x^y' 
  | 'mod' 
  | 'pyth'
  | '!'
  | 'x^2'
  | 'x^3'
  | 'modulus'
  | '%'
  | 'ln'
  | 'exp'
  ;

export type ConstantValue = 'π' | 'e';

export interface CardBase {
  id: string;
  type: CardType;
}

export interface NumberCard extends CardBase {
  type: 'number';
  value: number;
}

export interface ZeroCard extends CardBase {
  type: 'zero';
  value: 0;
}

export interface NegativeCard extends CardBase {
  type: 'negative';
  value: number; // Negative numbers from -1 to -9
}

export interface ArithmeticCard extends CardBase {
  type: 'arithmetic';
  operator: ArithmeticOperator;
}

export interface FunctionCard extends CardBase {
  type: 'function';
  operator: FunctionOperator;
}

export interface ConstantCard extends CardBase {
  type: 'constant';
  value: ConstantValue;
}

export interface VariableCard extends CardBase {
  type: 'variable';
  symbol: 'x';
}

export type Card = 
  | NumberCard 
  | ZeroCard 
  | NegativeCard 
  | ArithmeticCard 
  | FunctionCard 
  | ConstantCard 
  | VariableCard;

// Game State Types
export interface PlayerState {
  deck: Card[];
  hand: Card[];
  grindDeck: Card[];
  grindDeckValue: number;

  // Player progress & unlocks
  currentScore: number;
  hasUnlockedZero: boolean;
  hasUnlockedNegative: boolean;
  hasUnlockedFunctions: boolean;
  hasUnlockedConstants: boolean;
  hasUnlockedVariable: boolean;

  // Algebra-related state
  algebraDeck: Card[];
  algebraFunction: string;
  hasActiveAlgebraDeck: boolean;
}

export interface Move {
  id: string;
  type: 'number' | 'arithmetic' | 'function' | 'constant' | 'variable';
  timestamp: number;
  cards: Card[];
  resultValue?: number;
  description: string;
}

export interface GameState {
  // Game configuration
  gameMode: GameMode;
  difficulty: Difficulty;
  gameLength: GameLength;
  gameCode?: string; // For VS Player mode
  highScore: number;
  handSize: number;

  // Solo game mode configuration
  soloGameMode?: SoloGameMode;
  timeLimit?: number; // in seconds for time_limited mode
  deckLimit?: number; // number of cards for deck_limited mode
  targetScore?: number; // target score for reach_score mode

  // Game session tracking
  gameStartTime?: number; // timestamp when game started
  cardsPlayed?: number; // number of cards played in this session
  gameEndTime?: number; // timestamp when game ended
  isGameEnded?: boolean; // whether game has ended

  // Player states
  player: PlayerState;
  opponent?: PlayerState; // For VS Bot and VS Player modes

  // Deck state
  deckPool: Card[]; // The main deck pool for drawing cards

  // Targeting state
  activeTargetDeck: 'grind' | 'algebra' | 'opponent' | null;
  activePlayer: 'player' | 'opponent';
  isPlayerTurn: boolean;

  // Move tracking
  moves?: Move[];
}