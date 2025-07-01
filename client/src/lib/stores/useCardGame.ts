import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  Card, 
  CardType,
  ArithmeticOperator,
  FunctionOperator,
  Difficulty,
  GameState,
  ConstantValue,
  SoloGameMode
} from '@/types/card';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';
import { calculateArithmetic, calculateFunction, getConstantValue } from '@/components/game/MathFunctions';

interface Move {
  id: string;
  type: 'number' | 'arithmetic' | 'function' | 'constant' | 'variable';
  timestamp: number;
  cards: Card[];
  resultValue?: number;
  description: string;
}

interface CardGameStore extends GameState {
  // Game setup actions
  startGame: (difficulty: Difficulty, gameMode?: string, gameLength?: string, gameCode?: string, soloGameMode?: SoloGameMode, timeLimit?: number, deckLimit?: number, targetScore?: number) => void;
  resetGame: () => void;
  resetWithSameDifficulty: () => void;

  // Game actions
  drawCard: () => void;
  playNumberCard: (cardId: string) => void;
  playArithmeticCard: (cardId: string, targetNumber: string) => void;
  playFunctionCard: (cardId: string, secondNumberId?: string) => void;
  playConstantCard: (cardId: string) => void;
  playVariableCard: (cardId: string) => void;

  // Algebra-related actions
  setActiveTargetDeck: (target: 'grind' | 'algebra' | null) => void;
  applyAlgebraFunction: () => void;  // Apply algebra function to grind deck

  // Solo game mode actions
  checkGameEndConditions: () => void;
  endGame: (reason: 'time_up' | 'deck_finished' | 'score_reached') => void;
  getRemainingTime: () => number | null;
  getRemainingCards: () => number | null;

  // Utility functions
  getCardColor: (card: Card) => string;

  // Helper functions
  canUnlockFeature: (feature: string) => boolean;
  getFormattedAlgebraFunction: () => string;
}
// Helper function to generate localStorage keys
const getStorageKey = (key: string): string => {
  return `mathCardGame_${key}`;
};

// Initial state for a new game
const initialState: GameState = {
  // Game configuration
  gameMode: 'solo',
  difficulty: 'basic',
  gameLength: 'unlimited',
  highScore: getLocalStorage(getStorageKey('highScore')) || 0,
  handSize: 7,

  // Move tracking
  moves: [],

  // Solo game mode configuration
  soloGameMode: undefined,
  timeLimit: undefined,
  deckLimit: undefined,
  targetScore: undefined,

  // Game session tracking
  gameStartTime: undefined,
  cardsPlayed: 0,
  gameEndTime: undefined,
  isGameEnded: false,
  gameEndReason: undefined,

  // Player states
  player: {
    deck: [],
    hand: [],
    grindDeck: [],
    grindDeckValue: 0,
    currentScore: 0,
    hasUnlockedZero: false,
    hasUnlockedNegative: false,
    hasUnlockedFunctions: false,
    hasUnlockedConstants: false,
    hasUnlockedVariable: false,
    algebraDeck: [],
    algebraFunction: 'x',
    hasActiveAlgebraDeck: false,
  },

  // Deck state
  deckPool: [],

  // Targeting state
  activeTargetDeck: null,
  activePlayer: 'player',
  isPlayerTurn: true,
};

export const useCardGame = create<CardGameStore>((set, get) => ({
  ...initialState,

  canUnlockFeature: (feature: string): boolean => {
    const { currentScore, difficulty } = get();

    switch (feature) {
      case 'zero':
        return currentScore >= 100;
      case 'negative':
        return currentScore >= 500 && ['negative', 'functions', 'algebra'].includes(difficulty);
      case 'functions':
        return currentScore >= 1000 && ['functions', 'algebra'].includes(difficulty);
      case 'constants':
        return currentScore >= 10000 && ['decimals', 'negative', 'functions', 'algebra'].includes(difficulty);
      case 'variable':
        return currentScore >= 10000 && difficulty === 'algebra';
      default:
        return false;
    }
  },

  startGame: (difficulty, gameMode, gameLength, gameCode, soloGameMode, timeLimit, deckLimit, targetScore) => {
    // Generate initial deck and hand
    const deck = generateInitialDeck(difficulty);

    // Draw initial hand
    const { drawnCards, remainingDeck } = drawCards(deck, 7);

    // Create a new game state based on the chosen difficulty
    const state: GameState = {
      ...initialState,
      difficulty,
      gameMode: gameMode as any || 'solo',
      gameLength: gameLength as any || 'unlimited', 
      gameCode,
      soloGameMode,
      timeLimit,
      deckLimit,
      targetScore,
      highScore: getLocalStorage(getStorageKey('highScore')) || 0,
      gameStartTime: Date.now(),
      player: {
        ...initialState.player,
        hand: drawnCards,
        currentScore: 0
      },
      deckPool: remainingDeck
    };

    set(state);
  },

  resetGame: () => {
    // Reset the game to initial state but keep the high score
    const highScore = get().highScore;
    set({
      ...initialState,
      highScore
    });
  },

  resetWithSameDifficulty: () => {
    const currentDifficulty = get().difficulty;
    const highScore = get().highScore;
    set({
      ...initialState,
      difficulty: currentDifficulty,
      highScore
    });
    get().startGame(currentDifficulty);
  },

  drawCard: () => {
    const { deckPool, player, handSize } = get();

    // If hand is full, don't draw
    if (player.hand.length >= handSize) return;

    // If deck is empty, regenerate
    if (deckPool.length === 0) {
      const newDeck = generateDeck(get());
      set({ deckPool: newDeck });
    }

    // Draw one card
    const { drawnCards, remainingDeck } = drawCards(deckPool, 1);

    set({
      deckPool: remainingDeck,
      player: {
        ...player,
        hand: [...player.hand, ...drawnCards]
      }
    });

    // Ensure balance of numbers and arithmetic cards
    ensureHandBalance(get, set);
  },

  playNumberCard: (cardId) => {
    const state = get();
    const { hand, grindDeck, currentScore } = state.player;

    // Find the card in hand
    const card = hand.find(c => c.id === cardId);
    if (!card || (card.type !== 'number' && card.type !== 'zero' && 
                  card.type !== 'negative' && card.type !== 'constant')) return;

    // Get the card value based on type
    let cardValue = 0;
    if (card.type === 'number' || card.type === 'zero' || card.type === 'negative') {
      cardValue = card.value;
    } else if (card.type === 'constant') {
      cardValue = getConstantValue(card.value);
    }

    // If this is the first card (empty grind deck), set as starting number
    if (grindDeck.length === 0) {
      const move: Move = {
        id: uuidv4(),
        type: 'number',
        timestamp: Date.now(),
        cards: [card],
        resultValue: cardValue,
        description: `Started with ${cardValue}`
      };

      set({
        player: {
          ...state.player,
          grindDeck: [card],
          grindDeckValue: cardValue,
          hand: hand.filter(c => c.id !== cardId)
        },
        moves: [...(state.moves || []), move]
      });
    } else {
      // Otherwise, play this number with the last arithmetic card
      // (This shouldn't normally happen as per game rules, but handle it gracefully)
      set({
        player: {
          ...state.player,
          hand: hand.filter(c => c.id !== cardId)
        }
      });
    }

    // Check for unlocks based on current score
    checkForUnlocks(get, set);

    // Replenish hand after the play
    replenishHand(get, set);
  },

  playArithmeticCard: (cardId, targetNumberId) => {
    const state = get();
    const { hand, grindDeck, grindDeckValue, currentScore, algebraDeck, algebraFunction } = state.player;
    const { difficulty, activeTargetDeck } = state;

    // Find the arithmetic card in hand
    const arithmeticCard = hand.find(c => c.id === cardId);
    if (!arithmeticCard || arithmeticCard.type !== 'arithmetic') return;

    // Find the target number card in hand
    const numberCard = hand.find(c => c.id === targetNumberId);
    if (!numberCard || (numberCard.type !== 'number' && numberCard.type !== 'zero' && 
                        numberCard.type !== 'negative' && numberCard.type !== 'constant')) return;

    // Get number value based on card type
    let numberValue = 0;
    if (numberCard.type === 'number' || numberCard.type === 'zero' || numberCard.type === 'negative') {
      numberValue = numberCard.value;
    } else if (numberCard.type === 'constant') {
      numberValue = getConstantValue(numberCard.value);
    }

    // Prevent division by zero
    if ((arithmeticCard as any).operator === '÷' && numberValue === 0) {
      console.error("Division by zero is not allowed");
      return;
    }

    try {
      // Check if we're playing on the algebra deck or the grind deck
      if (activeTargetDeck === 'algebra' && algebraDeck.length > 0) {
        // Playing on algebra deck - update the algebraic function
        const operator = (arithmeticCard as any).operator;
        let newFunction = '';

        // Update the algebraic function based on the operator
        switch (operator) {
          case '+':
            newFunction = `(${algebraFunction} + ${numberValue})`;
            break;
          case '-':
            newFunction = `(${algebraFunction} - ${numberValue})`;
            break;
          case '×':
            newFunction = `(${algebraFunction} * ${numberValue})`;
            break;
          case '÷':
            newFunction = `(${algebraFunction} / ${numberValue})`;
            break;
          default:
            newFunction = algebraFunction;
        }

        // Update algebra deck and function
        set({
          player: {
            ...state.player,
            algebraDeck: [...algebraDeck, arithmeticCard, numberCard],
            algebraFunction: newFunction,
            hand: hand.filter(c => c.id !== cardId && c.id !== targetNumberId)
          }
        });

        // Replenish hand after play
        replenishHand(get, set);
      } 
      else {
        // Calculate new value for grind deck
        const newValue = calculateArithmetic(
          grindDeckValue, 
          numberValue, 
          (arithmeticCard as any).operator,
          difficulty
        );

        const move: Move = {
          id: uuidv4(),
          type: 'arithmetic',
          timestamp: Date.now(),
          cards: [arithmeticCard, numberCard],
          resultValue: newValue,
          description: `${grindDeckValue} ${(arithmeticCard as any).operator} ${numberValue} = ${newValue}`
        };

        // Update game state
        set({
          player: {
            ...state.player,
            grindDeck: [...grindDeck, arithmeticCard, numberCard],
            grindDeckValue: newValue,
            currentScore: newValue > currentScore ? newValue : currentScore,
            hand: hand.filter(c => c.id !== cardId && c.id !== targetNumberId)
          },
          cardsPlayed: (get().cardsPlayed || 0) + 2, // Increment by 2 (arithmetic + number card)
          moves: [...(state.moves || []), move]
        });

        // Update high score if needed
        const newScore = newValue > currentScore ? newValue : currentScore;
        if (newScore > get().highScore) {
          set({ highScore: newScore });
          setLocalStorage(getStorageKey('highScore'), newScore);
        }

        // Check for unlocks based on current score
        checkForUnlocks(get, set);

        // Replenish hand after the play
        replenishHand(get, set);

        // Check if game should end (for score-based or deck-limited modes)
        get().checkGameEndConditions();
      }
    } catch (error) {
      console.error("Error calculating arithmetic:", error);
      // Don't change game state if there's an error
    }
  },

  playFunctionCard: (cardId, secondNumberId) => {
    const state = get();
    const { hand, grindDeck, grindDeckValue, currentScore, algebraDeck, algebraFunction } = state.player;
    const { activeTargetDeck } = state;

    // Find the function card in hand
    const functionCard = hand.find(c => c.id === cardId);
    if (!functionCard || functionCard.type !== 'function') return;

    let secondNumber = undefined;
    let secondNumberValue = undefined;

    // Some functions require a second number
    if (['x^y', 'pyth','modulus'].includes((functionCard as any).operator) && secondNumberId) {
      secondNumber = hand.find(c => c.id === secondNumberId);
      if (!secondNumber || (secondNumber.type !== 'number' && secondNumber.type !== 'zero' && 
                           secondNumber.type !== 'negative' && secondNumber.type !== 'constant')) return;

      // Get number value based on card type
      if (secondNumber.type === 'number' || secondNumber.type === 'zero' || secondNumber.type === 'negative') {
        secondNumberValue = secondNumber.value;
      } else if (secondNumber.type === 'constant') {
        secondNumberValue = getConstantValue(secondNumber.value);
      }
    }

    // Update hand - remove cards played
    let newHand = hand.filter(c => c.id !== cardId);
    if (secondNumber && secondNumberId) {
      // Use a new variable assignment since filter returns a new array
      newHand = newHand.filter(c => c.id !== secondNumberId);
    }

    // Check if we're playing on the algebra deck or the grind deck
    if (activeTargetDeck === 'algebra' && algebraDeck.length > 0) {
      // Playing on algebra deck - update the algebraic function
      const operator = (functionCard as any).operator;
      let newFunction = '';

      // Update the algebraic function based on the operator
      switch (operator) {
        case '√':
          newFunction = `Math.sqrt(${algebraFunction})`;
          break;
        case '∛':
          newFunction = `Math.cbrt(${algebraFunction})`;
          break;
        case 'sin':
          newFunction = `Math.sin(${algebraFunction})`;
          break;
        case 'cos':
          newFunction = `Math.cos(${algebraFunction})`;
          break;
        case 'tan':
          newFunction = `Math.tan(${algebraFunction})`;
          break;
        case '1/x':
          newFunction = `(1/${algebraFunction})`;
          break;
        case 'x^y':
          if (secondNumberValue !== undefined) {
            newFunction = `Math.pow(${algebraFunction}, ${secondNumberValue})`;
          } else {
            newFunction = algebraFunction;
          }
          break;
        case 'mod':
          if (secondNumberValue !== undefined) {
            newFunction = `(${algebraFunction} % ${secondNumberValue})`;
          } else {
            newFunction = algebraFunction;
          }
          break;
        case 'pyth':
          if (secondNumberValue !== undefined) {
            newFunction = `Math.sqrt(${algebraFunction}*${algebraFunction} + ${secondNumberValue}*${secondNumberValue})`;
          } else {
            newFunction = algebraFunction;
          }
          break;
        default:
          newFunction = algebraFunction;
      }

      // Update algebra deck and function
      set({
        player: {
          ...state.player,
          algebraDeck: secondNumber 
            ? [...algebraDeck, functionCard, secondNumber]
            : [...algebraDeck, functionCard],
          algebraFunction: newFunction,
          hand: newHand
        }
      });

      // Replenish hand after play
      replenishHand(get, set);
    } 
    else {
      // Calculate new value for grind deck
      const newValue = calculateFunction(
        grindDeckValue, 
        (functionCard as any).operator,
        secondNumberValue
      );

      const move: Move = {
        id: uuidv4(),
        type: 'function',
        timestamp: Date.now(),
        cards: secondNumber ? [functionCard, secondNumber] : [functionCard],
        resultValue: newValue,
        description: secondNumberValue !== undefined 
          ? `${(functionCard as any).operator}(${grindDeckValue}, ${secondNumberValue}) = ${newValue}`
          : `${(functionCard as any).operator}(${grindDeckValue}) = ${newValue}`
      };

      // Update game state
      set({
        player: {
          ...state.player,
          grindDeck: secondNumber 
            ? [...grindDeck, functionCard, secondNumber]
            : [...grindDeck, functionCard],
          grindDeckValue: newValue,
          currentScore: newValue > currentScore ? newValue : currentScore,
          hand: newHand
        },
        moves: [...(state.moves || []), move]
      });

      // Update high score if needed
      const newScore = newValue > currentScore ? newValue : currentScore;
      if (newScore > get().highScore) {
        set({ highScore: newScore });
        setLocalStorage(getStorageKey('highScore'), newScore);
      }

      // Check for unlocks based on current score
      checkForUnlocks(get, set);

      // Increment cards played counter
      set({ cardsPlayed: (get().cardsPlayed || 0) + 1 });

      // Check for game end conditions (only if function exists)
      try {
        checkGameEndConditions?.(get, set);
      } catch (e) {
        console.warn('Game end condition check failed:', e);
      }

      // Replenish hand after the play
      replenishHand(get, set);
    }
  },

  playConstantCard: (cardId) => {
    // Constant cards are played like number cards
    get().playNumberCard(cardId);
  },

  playVariableCard: (cardId) => {
    const state = get();
    const { hand } = state.player;

    // Find the variable card in hand
    const card = hand.find(c => c.id === cardId);
    if (!card || card.type !== 'variable') return;

    // Initialize algebra deck with the variable card
    set({
      player: {
        ...state.player,
        hand: hand.filter(c => c.id !== cardId),
        algebraDeck: [card],
        algebraFunction: 'x',
        hasActiveAlgebraDeck: true
      },
      activeTargetDeck: 'algebra' // Default to algebra deck when created
    });
  },

  setActiveTargetDeck: (target) => {
    set({ activeTargetDeck: target });
  },

  applyAlgebraFunction: () => {
    const state = get();
    const { grindDeckValue, algebraFunction, currentScore, algebraDeck } = state.player;

    // If no algebra deck or function, do nothing
    if (!algebraFunction || algebraDeck.length === 0) return;

    try {
      // Import from MathFunctions 
      import('@/components/game/MathFunctions').then(({ evaluateAlgebraicExpression }) => {
        // Evaluate the algebraic function with the current grind deck value
        const newValue = evaluateAlgebraicExpression(algebraFunction, grindDeckValue);

        // Update game state
        set({
          player: {
            ...state.player,
            grindDeckValue: newValue,
            currentScore: newValue > currentScore ? newValue : currentScore,
            // Reset algebra deck and function
            algebraDeck: [],
            algebraFunction: 'x',
            hasActiveAlgebraDeck: false
          },
          activeTargetDeck: 'grind' // Default back to grind deck
        });

        // Update high score if needed
        const newScore = newValue > currentScore ? newValue : currentScore;
        if (newScore > get().highScore) {
          set({ highScore: newScore });
          setLocalStorage(getStorageKey('highScore'), newScore);
        }

        // Check for unlocks
        checkForUnlocks(get, set);
      });
    } catch (error) {
      console.error("Error applying algebra function:", error);
    }
  },

  getFormattedAlgebraFunction: () => {
    return get().algebraFunction || 'x';
  },

  getCardColor: (card) => {
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
  },

  // Solo game mode methods (using simpler approach with existing structure)
  checkGameEndConditions: () => {
    const state = get();
    if (!state.soloGameMode || state.isGameEnded) return;

    console.log('Checking end game conditions:', {
      soloGameMode: state.soloGameMode,
      timeLimit: state.timeLimit,
      deckLimit: state.deckLimit,
      targetScore: state.targetScore,
      cardsPlayed: state.cardsPlayed,
      currentScore: state.player?.currentScore
    });

    const currentTime = Date.now();
    const elapsedTime = state.gameStartTime ? Math.floor((currentTime - state.gameStartTime) / 1000) : 0;

    switch (state.soloGameMode) {
      case 'time_limited':
        if (state.timeLimit && elapsedTime >= state.timeLimit) {
          console.log('Time limit reached, ending game');
          get().endGame('time_up');
        }
        break;
      case 'deck_limited':
        if (state.deckLimit && (state.cardsPlayed || 0) >= state.deckLimit) {
          console.log('Deck limit reached, ending game');
          get().endGame('deck_finished');
        }
        break;
      case 'reach_score':
        if (state.targetScore && (state.player?.currentScore || 0) >= state.targetScore) {
          console.log('Target score reached, ending game');
          get().endGame('score_reached');
        }
        break;
    }
  },

  endGame: (reason) => {
    const state = get();
    set({
      isGameEnded: true,
      gameEndTime: Date.now(),
      gameEndReason: reason
    });

    // Game end logic is handled by the Game component
    // which watches for isGameEnded changes
  },

  getRemainingTime: () => {
    const state = get();
    if (state.soloGameMode !== 'time_limited' || !state.timeLimit || !state.gameStartTime) {
      return null;
    }
    const elapsedTime = Math.floor((Date.now() - state.gameStartTime) / 1000);
    return Math.max(0, state.timeLimit - elapsedTime);
  },

  getRemainingCards: () => {
    const state = get();
    if (state.soloGameMode !== 'deck_limited' || !state.deckLimit) {
      return null;
    }
    return Math.max(0, state.deckLimit - (state.cardsPlayed || 0));
  }
}));

// Helper functions

// Check if game should end based on solo mode conditions
function checkGameEndConditions(get: () => CardGameStore, set: (state: Partial<CardGameStore>) => void) {
  const state = get();

  // Only check end conditions for solo modes
  if (!state.soloGameMode || state.isGameEnded) return;

  switch (state.soloGameMode) {
    case 'deck_limited':
      if (state.deckLimit && state.cardsPlayed && state.cardsPlayed >= state.deckLimit) {
        state.endGame('deck_finished');
      }
      break;

    case 'reach_score':
      if (state.targetScore && state.player?.currentScore && state.player.currentScore >= state.targetScore) {
        state.endGame('score_reached');
      }
      break;

    case 'time_limited':
      // Time checks are handled by the Timer component
      break;

    case 'unlimited':
      // No end conditions for unlimited mode
      break;
  }
}

// Generate initial deck based on difficulty
function generateInitialDeck(difficulty: Difficulty): Card[] {
  const deck: Card[] = [];

  // Add number cards (1-9) - 3 copies each
  for (let i = 1; i <= 9; i++) {
    for (let j = 0; j < 3; j++) {
      deck.push({
        id: uuidv4(),
        type: 'number',
        value: i
      });
    }
  }

  // Add arithmetic cards - 3 copies each
  const operators: ArithmeticOperator[] = ['+', '-', '×', '÷'];
  operators.forEach(op => {
    for (let i = 0; i < 3; i++) {
      deck.push({
        id: uuidv4(),
        type: 'arithmetic',
        operator: op
      });
    }
  });

  // Zero card
  deck.push({
    id: uuidv4(),
    type: 'zero',
    value: 0
  });

  // Negative numbers
  if (['negative', 'functions', 'algebra'].includes(difficulty)) {
    for (let i = 1; i <= 9; i++) {
      for (let j = 0; j < 2; j++) { // 2 copies
        deck.push({
          id: uuidv4(),
          type: 'negative',
          value: -i
        });
      }
    }
  }

  // Function cards
  if (['functions', 'algebra'].includes(difficulty)) {
    const functionOps: FunctionOperator[] = ['√', '∛', 'sin', 'cos', 'tan', '1/x', 'mod', 'pyth','x^2','x^3','ln','%'];
    functionOps.forEach(op => {
      for (let i = 0; i < 2; i++) { // Reduced from 4 to 2 copies
        deck.push({
          id: uuidv4(),
          type: 'function',
          operator: op
        });
      }
    });
    const functionOpsHard: FunctionOperator[] = ['x^y','!','exp'];
    functionOps.forEach(op => {
      deck.push({
        id: uuidv4(),
        type: 'function',
        operator: op
      });
    });
  }

  // Constants
  if (['decimals', 'negative', 'functions', 'algebra'].includes(difficulty)) {
    deck.push(
      {
        id: uuidv4(),
        type: 'constant',
        value: 'π'
      },
      {
        id: uuidv4(),
        type: 'constant',
        value: 'e'
      }
    );
  }

  // Shuffle the deck
  return shuffleArray(deck);
}

// Generate a new deck based on game state and unlocks
function generateDeck(state: GameState): Card[] {
  const deck: Card[] = [];
  const { difficulty } = state;

  // Add number cards (1-9) - optimized for smaller deck size
  for (let i = 1; i <= 9; i++) {
    for (let j = 0; j < 2; j++) { // Reduced from 4 to 2 copies
      deck.push({
        id: uuidv4(),
        type: 'number',
        value: i
      });
    }
  }

  // Add arithmetic cards - reduced copies
  const operators: ArithmeticOperator[] = ['+', '-', '×', '÷'];
  operators.forEach(op => {
    for (let i = 0; i < 2; i++) { //2 copies
      deck.push({
        id: uuidv4(),
        type: 'arithmetic',
        operator: op
      });
    }
  });

  // Zero card
  deck.push({
    id: uuidv4(),
    type: 'zero',
    value: 0
  });

  // Negative numbers (reduced copies)
  if (['negative', 'functions', 'algebra'].includes(difficulty)) {
    for (let i = 1; i <= 9; i++) {
      deck.push({
        id: uuidv4(),
        type: 'negative',
        value: -i
      });
    }
  }

  // Function cards (single copy each)
  if (['functions', 'algebra'].includes(difficulty)) {
    const functionOps: FunctionOperator[] = ['√', '∛', 'sin', 'cos', 'tan', '1/x', 'x^y', 'mod', 'pyth','!','x^2','x^3','ln','%','exp'];
    functionOps.forEach(op => {
      deck.push({
        id: uuidv4(),
        type: 'function',
        operator: op
      });
    });
  }

  // Constants
  if (['decimals', 'negative', 'functions', 'algebra'].includes(difficulty)) {
    deck.push(
      {
        id: uuidv4(),
        type: 'constant',
        value: 'π'
      },
      {
        id: uuidv4(),
        type: 'constant',
        value: 'e'
      }
    );
  }
/*
  // Variable x
  if (state.hasUnlockedVariable && state.difficulty === 'algebra') {
    deck.push({
      id: uuidv4(),
      type: 'variable',
      symbol: 'x'
    });*/

  // Shuffle the deck
  return shuffleArray(deck);
}

// Draw cards from deck
function drawCards(deck: Card[], count: number): { drawnCards: Card[], remainingDeck: Card[] } {
  const drawnCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { drawnCards, remainingDeck };
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Ensure hand has minimum required cards
function ensureHandBalance(get: () => CardGameStore, set: (state: Partial<CardGameStore>) => void) {
  const state = get();
  const { hand, deck } = state.player;
  const { handSize, difficulty } = state;

  // Count card types
  const numberCount = hand.filter(c => ['number', 'zero', 'negative', 'constant'].includes(c.type)).length;
  const arithmeticCount = hand.filter(c => c.type === 'arithmetic').length;
  const functionCount = hand.filter(c => c.type === 'function').length;

  let newDeck = [...deck];
  let newHand = [...hand];

  // Ensure at least 1 number card
  if (numberCount < 1) {
    // Generate number cards if needed
    const numbersNeeded = 1 - numberCount;
    for (let i = 0; i < numbersNeeded; i++) {
      // Find a number card in deck or create one
      const numberCardIndex = newDeck.findIndex(c => ['number', 'zero', 'negative', 'constant'].includes(c.type));

      if (numberCardIndex >= 0) {
        // Move from deck to hand
        newHand.push(newDeck[numberCardIndex]);
        newDeck.splice(numberCardIndex, 1);
      } else {
        // Create a new number card
        newHand.push({
          id: uuidv4(),
          type: 'number',
          value: Math.floor(Math.random() * 9) + 1
        });
      }
    }
  };

  if(['functions'].includes(difficulty)){/*
    if(arithmeticCount == 0 && functionCount != 0){
      const arithmeticCardIndex = newDeck.findIndex(c => c.type === 'arithmetic');
        if (arithmeticCardIndex >= 0) {
          // Move from deck to hand
          newHand.push(newDeck[arithmeticCardIndex]);
          newDeck.splice(arithmeticCardIndex, 1);
        } else {
          // Create a new arithmetic card
          const operators: ArithmeticOperator[] = ['+', '-', '×', '÷'];
          newHand.push({
            id: uuidv4(),
            type: 'arithmetic',
            operator: operators[Math.floor(Math.random() * operators.length)]
          });
        }
    }*/
    if(functionCount == 0){
      const functionCardIndex = newDeck.findIndex(c => c.type === 'function');

        if (functionCardIndex >= 0) {
          // Move from deck to hand
          newHand.push(newDeck[functionCardIndex]);
          newDeck.splice(functionCardIndex, 1);
        } else {
          // Create a new arithmetic card
          const operators: FunctionOperator[] = ['√', '∛', 'sin', 'cos', 'tan', '1/x', 'x^y', 'mod', 'pyth','!','x^2','x^3','ln','%','exp'];
          newHand.push({
            id: uuidv4(),
            type: 'function',
            operator: operators[Math.floor(Math.random() * operators.length)]
          });
        }
    };
    if(arithmeticCount == 0){

        const arithmeticCardIndex = newDeck.findIndex(c => c.type === 'arithmetic');
        if (arithmeticCardIndex >= 0) {
          // Move from deck to hand
          newHand.push(newDeck[arithmeticCardIndex]);
          newDeck.splice(arithmeticCardIndex, 1);
        } else {
          // Create a new arithmetic card
          const operators: ArithmeticOperator[] = ['+', '-', '×', '÷'];
          newHand.push({
            id: uuidv4(),
            type: 'arithmetic',
            operator: operators[Math.floor(Math.random() * operators.length)]
          });
        }
    };
  }
  else{
  // Ensure at least 1 arithmetic cards
    if (arithmeticCount < 2) {
      // Generate the missing arithmetic cards
      const arithmeticNeeded = 2 - arithmeticCount;
      for (let i = 0; i < arithmeticNeeded; i++) {
        // Find an arithmetic card in deck or create one
        const arithmeticCardIndex = newDeck.findIndex(c => c.type === 'arithmetic');

        if (arithmeticCardIndex >= 0) {
          // Move from deck to hand
          newHand.push(newDeck[arithmeticCardIndex]);
          newDeck.splice(arithmeticCardIndex, 1);
        } else {
          // Create a new arithmetic card
          const operators: ArithmeticOperator[] = ['+', '-', '×', '÷'];
          newHand.push({
            id: uuidv4(),
            type: 'arithmetic',
            operator: operators[Math.floor(Math.random() * operators.length)]
          });
        }
      }
    }
  };

  // Update state if changes were made
  if (newHand.length !== hand.length || newDeck.length !== deck.length) {
    set({
      player: {
        ...state.player,
        hand: newHand,
        deck: newDeck
      }
    });
  }
};

// Replenish hand to full capacity
function replenishHand(get: () => CardGameStore, set: (state: Partial<CardGameStore>) => void) {
  ensureHandBalance(get, set);
  const state = get();
  const { hand, deck } = state.player;
  const { handSize } = state;

  // If hand is already full, do nothing
  if (hand.length >= handSize) return;

  // Calculate how many cards to draw
  const cardsToDraw = handSize - hand.length;

  // Check if deck has enough cards
  if (deck.length < cardsToDraw) {
    // Generate a new deck
    const newDeck = generateDeck(get());
    set({ 
      player: {
        ...state.player,
        deck: newDeck
      }
    });
  }

  // Draw cards and update hand
  const currentState = get();
  const { drawnCards, remainingDeck } = drawCards(currentState.player.deck, cardsToDraw);
  set({
    player: {
      ...currentState.player,
      hand: [...hand, ...drawnCards],
      deck: remainingDeck
    }
  });
  // Ensure hand balance

}









// Check for unlocks based on score
function checkForUnlocks(get: () => CardGameStore, set: (state: Partial<CardGameStore>) => void) {
  const { 
    currentScore, 
    hasUnlockedZero, 
    hasUnlockedNegative, 
    hasUnlockedFunctions, 
    hasUnlockedConstants, 
    hasUnlockedVariable,
    difficulty,
    handSize,
    hand
  } = get();

  const updates: Partial<CardGameStore> = {};
  const newCardsToAdd: Card[] = [];

  // Save the difficulty to localStorage for MathFunctions to access
  try {
    localStorage.setItem(getStorageKey('difficulty'), JSON.stringify(difficulty));
  } catch (e) {
    // Ignore localStorage errors
  }

  // Unlock zero card at score 100
  if (currentScore >= 100 && !hasUnlockedZero) {
    updates.hasUnlockedZero = true;

    // Add a zero card directly to the hand
    newCardsToAdd.push({
      id: uuidv4(),
      type: 'zero',
      value: 0
    });
  }

  // Unlock negative numbers at score 500 (difficulty 3+)
  if (currentScore >= 500 && !hasUnlockedNegative && 
      ['negative', 'functions', 'algebra'].includes(difficulty)) {
    updates.hasUnlockedNegative = true;

    // Add a negative card directly to the hand
    newCardsToAdd.push({
      id: uuidv4(),
      type: 'negative',
      value: -Math.floor(Math.random() * 9) - 1 // Random negative number between -1 and -9
    });
  }





//Difficulty  unlocks  

  // Unlock function cards at score 1000 (difficulty 4+)
  if (currentScore >= 1000 && !hasUnlockedFunctions && 
      ['functions', 'algebra'].includes(difficulty)) {
    updates.hasUnlockedFunctions = true;

    // Add a function card directly to the hand
    const functionOps: FunctionOperator[] = ['√', '∛', 'sin', 'cos', 'tan', '1/x', 'x^y', 'mod', 'pyth','!','x^2','x^3','ln','%','exp'];
    const randomOp = functionOps[Math.floor(Math.random() * functionOps.length)];

    newCardsToAdd.push({
      id: uuidv4(),
      type: 'function',
      operator: randomOp
    });

    // Increase hand size to 9
    if (handSize < 9) {
      updates.handSize = 9;
    }
  }

  // Unlock pi and e at score 10000 (difficulty 2+)
  if (currentScore >= 10000 && !hasUnlockedConstants && 
      ['decimals', 'negative', 'functions', 'algebra'].includes(difficulty)) {
    updates.hasUnlockedConstants = true;

    // Add a constant card directly to the hand
    const constants = ['π', 'e'] as const;
    const randomConstant = constants[Math.floor(Math.random() * constants.length)];

    newCardsToAdd.push({
      id: uuidv4(),
      type: 'constant',
      value: randomConstant
    });
  }

  // Unlock variable x at score 10000 (difficulty 5)
  if (currentScore >= 10000 && !hasUnlockedVariable && difficulty === 'algebra') {
    updates.hasUnlockedVariable = true;

    // Add variable card directly to the hand
    newCardsToAdd.push({
      id: uuidv4(),
      type: 'variable',
      symbol: 'x'
    });
  }

  // Apply updates to state flags
  if (Object.keys(updates).length > 0) {
    set(updates);
  }

  // Add the new cards to the hand if any were created
  if (newCardsToAdd.length > 0) {
    // Only add cards if there's room in the hand
    const availableSpace = handSize - hand.length;
    const cardsToActuallyAdd = newCardsToAdd.slice(0, availableSpace);

    if (cardsToActuallyAdd.length > 0) {
      set({
        hand: [...hand, ...cardsToActuallyAdd]
      });
    }
  }
}