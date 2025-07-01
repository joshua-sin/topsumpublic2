import { FunctionOperator } from '@/types/card';

/**
 * Calculates the result of applying an arithmetic operation
 */
export function calculateArithmetic(a: number, b: number, operator: string, difficulty: string = 'basic'): number {
  // Function to round based on difficulty
  const roundBasedOnDifficulty = (num: number): number => {
    // For difficulty level 1 (basic), only return integers for division
    if (difficulty === 'basic' && operator === '÷') {
      return Math.floor(num); // Take only the quotient (whole part)
    }
    
    // For other difficulties, round to 3 decimal places
    return Math.round(num * 1000) / 1000;
  };
  
  // Handle special case: if grindDeck is 0, allow replacing with any number
  if (a === 0) {
    return roundBasedOnDifficulty(b);
  }
  
  switch (operator) {
    case '+':
      return roundBasedOnDifficulty(a + b);
    case '-':
      return roundBasedOnDifficulty(a - b);
    case '×':
      return roundBasedOnDifficulty(a * b);
    case '÷':
      if (b === 0) {
        throw new Error("Division by zero is not allowed");
      }
      
      // Special handling for basic difficulty - only return whole quotient
      if (difficulty === 'basic') {
        return Math.floor(a / b);
      }
      return roundBasedOnDifficulty(a / b);
    default:
      return roundBasedOnDifficulty(a);
  }
}

/**
 * Calculates the result of applying a mathematical function
 */
export function calculateFunction(value: number, func: FunctionOperator, secondValue?: number): number {
  // Round the result to 3 decimal places
  const roundToThreeDecimals = (num: number): number => {
    return Math.round(num * 1000) / 1000;
  };
  
  // Special case handling for when the Grind Deck has value of 0
  if (value === 0) {
    if (secondValue !== undefined && ['x^y', 'pyth'].includes(func)) {
      return roundToThreeDecimals(secondValue);
    }
    return 0; // For other functions keep as 0
  }
  
  switch (func) {
    case '√':
      return value > 0 ? roundToThreeDecimals(Math.sqrt(Math.max(0, value))) : value; // Prevent negative square roots
    case '∛':
      return roundToThreeDecimals(Math.cbrt(value));
    case 'sin':
      return roundToThreeDecimals(Math.sin(value * (Math.PI / 180))); // Convert to radians
    case 'cos':
      return roundToThreeDecimals(Math.cos(value * (Math.PI / 180))); // Convert to radians
    case 'tan':
      return roundToThreeDecimals(Math.tan(value * (Math.PI / 180))); // Convert to radians
    case '1/x':
      return value === 0 ? 0 : roundToThreeDecimals(1 / value); // Prevent division by zero
    case 'x^y':
      return secondValue !== undefined ? roundToThreeDecimals(Math.pow(value, secondValue)) : value;
    case 'mod':
      return Math.abs(value);
    case 'pyth':
      return secondValue !== undefined 
        ? roundToThreeDecimals(Math.sqrt(Math.pow(value, 2) + Math.pow(secondValue, 2))) 
        : value;
    case '!':
      var val = roundToThreeDecimals(value);
      var n = 1;
      for (let i = val; i > 0; i--){
        n = n * i;
      }
      return n;
      return math.factorial(Math.round(value));
    case 'x^2':
      return roundToThreeDecimals(value * value);
    case 'x^3':
      return roundToThreeDecimals((value*value)*value);
      /*
    case 'modulus':
      return secondValue !== undefined
        ? roundToThreeDecimals(math.mod(roundToThreeDecimals(value), secondValue))
        : value;*/
    case 'ln':
      return value > 0 ? Math.log(value) : value;
    case '%':
      return value * 100;
    case 'exp':
      return roundToThreeDecimals(Math.exp(value));
    default:
      return roundToThreeDecimals(value);
  }
}

/**
 * Returns the value of a mathematical constant
 */
export function getConstantValue(constant: string): number {
  // Round the constant values to 3 decimal places for consistency
  const roundToThreeDecimals = (num: number): number => {
    return Math.round(num * 1000) / 1000;
  };
  
  switch (constant) {
    case 'π':
      return roundToThreeDecimals(Math.PI);
    case 'e':
      return roundToThreeDecimals(Math.E);
    default:
      return 0;
  }
}

/**
 * Evaluates an algebraic expression with the variable x
 * @param expression The expression string (e.g., "2x + 3")
 * @param xValue The value to substitute for x
 * @returns The result of the expression
 */
export function evaluateAlgebraicExpression(expression: string, xValue: number): number {
  // Round the result to 3 decimal places
  const roundToThreeDecimals = (num: number): number => {
    return Math.round(num * 1000) / 1000;
  };
  
  try {
    // Replace all x with the actual value
    const preparedExpression = expression.replace(/x/g, xValue.toString());
    
    // Simple evaluation - in a real app you'd use a proper math expression parser
    // This is a simplified version for demo purposes
    // For a real implementation, consider using math.js or a similar library
    const result = Function('"use strict"; return (' + preparedExpression + ')')();
    
    // Handle special case of dividing by zero
    if (!isFinite(result)) {
      return xValue; // Return original value if result is Infinity or NaN
    }
    
    return roundToThreeDecimals(result);
  } catch (error) {
    console.error("Error evaluating expression:", error);
    return 0;
  }
}
