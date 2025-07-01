import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/types/card';
import { useCardGame } from '@/lib/stores/useCardGame';
import { cn } from '@/lib/utils';
//import { useIsMobile } from "@/hooks/use-is-mobile";

interface CardProps {
  card: CardType;
  index: number;
  isInHand: boolean;
  isSelected?: boolean;
  onSelect?: (cardId: string) => void;
  selectable?: boolean;
}

//const isMobile = useIsMobile();
export function Card({ 
  card, 
  index, 
  isInHand, 
  isSelected = false,
  onSelect,
  selectable = true
}: CardProps) {
  const getCardColor = useCardGame(state => state.getCardColor);
  const [isHovered, setIsHovered] = useState(false);
  
  const getCardContent = () => {
    switch (card.type) {
      case 'number':
      case 'zero':
      case 'negative':
        return <span className="text-3xl font-bold">{card.value}</span>;
      case 'arithmetic':
        return <span className="text-3xl font-bold">{card.operator}</span>;
      case 'function':
        return <span className="text-xl font-bold">{card.operator}</span>;
      case 'constant':
        return <span className="text-3xl font-bold">{card.value}</span>;
      case 'variable':
        return <span className="text-3xl font-bold">x</span>;
      default:
        return null;
    }
  };
  
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(card.id);
    }
  };
  
  const cardColor = getCardColor(card);
  //if (!isMobile){
  return (
    <motion.div
      className={cn(
        "relative w-24 h-36 rounded-lg border-4 border-white shadow-lg flex items-center justify-center cursor-pointer",
        cardColor,
        isSelected ? "ring-4 ring-yellow-300 scale-110" : "",
        !selectable ? "opacity-70 cursor-not-allowed" : ""
      )}
      initial={{ 
        scale: 0.8, 
        opacity: 0,
        y: isInHand ? 100 : -100 
      }}
      animate={{ 
        scale: isSelected ? 1.1 : isHovered ? 1.05 : 1, 
        opacity: 1,
        y: 0,
        zIndex: isSelected ? 10 : 0
      }}
      whileHover={{ scale: selectable ? 1.05 : 1 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: index * 0.1 
      }}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {getCardContent()}
    </motion.div>
  );/*
}
else{
 return (
    <motion.div
      
      className={cn(
        "relative w-16 h-24 rounded-lg border-4 border-white shadow-lg flex items-center justify-center cursor-pointer",
        cardColor,
        isSelected ? "ring-4 ring-yellow-300 scale-110" : "",
        !selectable ? "opacity-70 cursor-not-allowed" : ""
      )}
      initial={{ 
        scale: 0.8, 
        opacity: 0,
        y: isInHand ? 100 : -100 
      }}
      animate={{ 
        scale: isSelected ? 1.1 : isHovered ? 1.05 : 1, 
        opacity: 1,
        y: 0,
        zIndex: isSelected ? 10 : 0
      }}
      whileHover={{ scale: selectable ? 1.05 : 1 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: index * 0.1 
      }}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <p style={{ transform: "rotate(90deg)" }}>{getCardContent()}</p>
      
    </motion.div>
  );
};*/};