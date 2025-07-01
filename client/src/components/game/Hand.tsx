import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card as CardComponent } from './Card';
import { Card as CardType, ArithmeticCard, FunctionCard } from '@/types/card';
import { useCardGame } from '@/lib/stores/useCardGame';

interface HandProps {
  cards: CardType[];
}

export function Hand({ cards }: HandProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [secondCardNeeded, setSecondCardNeeded] = useState(false);
  const [secondCardSelected, setSecondCardSelected] = useState<string | null>(null);
  
  const gameState = useCardGame();
  const {
    playNumberCard,
    playArithmeticCard,
    playFunctionCard,
    playConstantCard,
    playVariableCard,
    player,
    activeTargetDeck
  } = gameState;
  
  // Extract player properties with fallbacks
  const grindDeck = player?.grindDeck || [];
  const hasActiveAlgebraDeck = player?.hasActiveAlgebraDeck || false;
  const algebraDeck = player?.algebraDeck || [];
  
  // Reset selected cards when hand changes
  useEffect(() => {
    setSelectedCard(null);
    setSecondCardNeeded(false);
    setSecondCardSelected(null);
  }, [cards.length]);
  
  const handleCardSelect = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    // If we're waiting for a second card
    if (secondCardNeeded) {
      // If clicking on the same arithmetic/function card that's already selected, deselect it
      if (cardId === selectedCard) {
        setSelectedCard(null);
        setSecondCardNeeded(false);
        return;
      }
      
      // If clicking on a non-number card that's not arithmetic, do nothing
      if (!['number', 'zero', 'negative', 'constant', 'arithmetic'].includes(card.type)) {
        return;
      }
      
      // If clicking on a different arithmetic card, deselect the current one and select the new one
      if (card.type === 'arithmetic') {
        setSelectedCard(cardId);
        setSecondCardNeeded(true);
        setSecondCardSelected(null);
        return;
      }
      
      // For a number card, proceed with the operation
      setSecondCardSelected(cardId);
      
      // Execute the action with both cards
      const firstCard = cards.find(c => c.id === selectedCard);
      if (firstCard?.type === 'function') {
        playFunctionCard(selectedCard!, cardId);
      } else if (firstCard?.type === 'arithmetic') {
        playArithmeticCard(selectedCard!, cardId);
      }
      
      // Reset selection state
      setSelectedCard(null);
      setSecondCardNeeded(false);
      setSecondCardSelected(null);
      return;
    }
    
    // If player clicks on the same card that's already selected, deselect it
    if (cardId === selectedCard) {
      setSelectedCard(null);
      setSecondCardNeeded(false);
      return;
    }
    
    // First card selection logic
    setSelectedCard(cardId);
    
    // Determine what to do based on card type
    switch (card.type) {
      case 'number':
      case 'zero':
      case 'negative':
        // If this is the first play of the game and no algebra deck active
        if (grindDeck.length === 0 && !hasActiveAlgebraDeck) {
          playNumberCard(cardId);
          setSelectedCard(null);
        } else {
          // Otherwise, wait for an arithmetic card
          setSelectedCard(cardId);
        }
        break;
      
      case 'arithmetic':
        // With arithmetic cards, just need any valid deck to play on
        // If no algebra deck and grind deck is empty, can't play
        if (grindDeck.length === 0 && !hasActiveAlgebraDeck) {
          setSelectedCard(null);
          return;
        }
        
        // Need a number card to complete the operation
        setSecondCardNeeded(true);
        break;
      
      case 'function':
        // With function cards, just need any valid deck to play on
        // If no algebra deck and grind deck is empty, can't play
        if (grindDeck.length === 0 && !hasActiveAlgebraDeck) {
          setSelectedCard(null);
          return;
        }
        
        // Determine if this function needs a second card
        const operator = (card as FunctionCard).operator;
        if (['x^y', 'pyth'].includes(operator)) {
          setSecondCardNeeded(true);
        } else {
          // Functions that operate only on the target deck value
          playFunctionCard(cardId);
          setSelectedCard(null);
        }
        break;
      
      case 'constant':
        // Play like a number card
        if (grindDeck.length === 0 && !hasActiveAlgebraDeck) {
          playConstantCard(cardId);
          setSelectedCard(null);
        } else {
          setSelectedCard(cardId);
        }
        break;
      
      case 'variable':
        // Special handling for variable cards
        playVariableCard(cardId);
        setSelectedCard(null);
        break;
    }
  };
  
  // Determine if a card is selectable based on game state
  const isCardSelectable = (card: CardType): boolean => {
    // First play in an empty game must be a number card
    if (grindDeck.length === 0 && !hasActiveAlgebraDeck) {
      return ['number', 'zero', 'negative', 'constant'].includes(card.type);
    }
    
    // If waiting for second card, only number cards are selectable, plus allow deselecting current card
    if (secondCardNeeded) {
      if (card.id === selectedCard) {
        return true; // Allow deselecting the current card
      }
      return ['number', 'zero', 'negative', 'constant'].includes(card.type);
    }
    
    // Otherwise all cards are selectable
    return true;
  };
  
  return (
    <div className="relative">
      {/* Fixed position message overlay */}
      {secondCardNeeded && (
        <motion.div 
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-sm font-medium shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          Select a number card to complete the operation
        </motion.div>
      )}
      
      <motion.div 
        className="flex justify-center items-center gap-4 px-4 py-6 bg-gray-100 rounded-xl border-2 border-gray-300"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        
      {cards.map((card, index) => (
        <CardComponent
          key={card.id}
          card={card}
          index={index}
          isInHand={true}
          isSelected={card.id === selectedCard || card.id === secondCardSelected}
          onSelect={handleCardSelect}
          selectable={isCardSelectable(card)}
        />
      ))}
      {/* Show the active target deck indicator */}
      {hasActiveAlgebraDeck && activeTargetDeck && (
        <div className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium
          ${activeTargetDeck === 'grind' 
            ? 'bg-blue-100 border-2 border-blue-400' 
            : 'bg-black text-white border-2 border-gray-800'}`}
        >
          Playing on: {activeTargetDeck === 'grind' ? 'Grind Deck' : 'Algebra Deck'}
        </div>
      )}
      
      </motion.div>
    </div>
  );
}
