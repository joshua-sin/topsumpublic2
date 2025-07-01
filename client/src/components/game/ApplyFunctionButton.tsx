import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCardGame } from '@/lib/stores/useCardGame';

export function ApplyFunctionButton() {
  const { hasActiveAlgebraDeck, applyAlgebraFunction, getFormattedAlgebraFunction, grindDeckValue } = useCardGame();

  // Only show if there's an active algebra deck
  if (!hasActiveAlgebraDeck) return null;

  const algebraFunction = getFormattedAlgebraFunction();
  
  // Display a preview of the result
  const handleApplyFunction = () => {
    applyAlgebraFunction();
  };

  return (
    <motion.div
      className="p-3 bg-white rounded-lg shadow-lg border border-gray-300"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="mb-2 text-sm font-medium text-center">
        Apply Function:
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-gray-600">
          f({grindDeckValue}) = <span className="font-mono">{algebraFunction}</span>
        </div>
        <Button 
          onClick={handleApplyFunction}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          Apply to Grind Deck
        </Button>
      </div>
    </motion.div>
  );
}