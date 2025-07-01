# TOP SUM - Mathematical Card Game

## Overview

TOP SUM is a mathematical card game web application where players combine number cards with arithmetic operations to achieve the highest possible score. The game features multiple difficulty levels, progressive unlocks, and is built with modern web technologies for smooth gameplay experience.

The application follows a full-stack architecture with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM. The game is designed with scalability in mind to support future features like multiplayer and bot opponents.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: React Router for navigation between game states
- **State Management**: Zustand stores for game state and audio management
- **Styling**: Tailwind CSS with Radix UI components for consistent design
- **Animations**: Framer Motion for smooth card animations and transitions
- **3D Graphics**: React Three Fiber with additional libraries for future 3D enhancements
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: In-memory storage with interface for future database persistence
- **API Design**: RESTful endpoints with /api prefix for clear separation

### Game Logic Architecture
- **Card System**: Type-safe card definitions with support for numbers, arithmetic operations, functions, and constants
- **Difficulty Progression**: Five difficulty levels with progressive feature unlocks
- **Score System**: Real-time score calculation with milestone-based unlocks
- **Audio System**: Context-based audio management with mute/unmute functionality

## Key Components

### Card System
The game implements a comprehensive card type system:
- **Number Cards**: Blue cards with values 1-9
- **Arithmetic Cards**: Red cards with +, -, ×, ÷ operations
- **Special Cards**: Zero cards (rare, unlocked at score 100)
- **Negative Cards**: Purple cards with negative values (unlocked at score 500)
- **Function Cards**: Green cards with advanced mathematical operations (unlocked at score 1000)
- **Constant Cards**: Yellow cards with π and e (unlocked at score 10000)

### Game State Management
- **Hand Management**: Maximum 7 cards with automatic replenishment
- **Grind Deck**: Accumulates played cards and calculates running total
- **Algebra Deck**: Advanced feature for algebraic operations
- **Score Tracking**: Current score and high score persistence

### Progressive Difficulty System
1. **Basic Arithmetic**: Simple operations with whole numbers
2. **Decimals and Fractions**: Introduces decimal calculations
3. **Negative Numbers**: Adds negative number cards
4. **Functions**: Advanced mathematical functions
5. **Algebra**: Variable and algebraic expressions (planned)

## Data Flow

### Game Initialization
1. User selects game mode and difficulty
2. Initial deck of 7 cards generated (4 numbers, 3 arithmetic)
3. Game state initialized with starting values

### Card Play Sequence
1. Player selects cards from hand
2. Cards are validated for legal combinations
3. Mathematical operations calculated
4. Grind deck updated with result
5. Score incremented
6. Hand replenished from deck
7. Unlock conditions checked

### Score and Unlock System
- Score increases with each successful card play
- Milestone achievements unlock new card types
- High score persisted across sessions

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React Router, React Query for data fetching
- **UI Components**: Radix UI primitives with custom Tailwind styling
- **Animation**: Framer Motion for smooth transitions
- **State Management**: Zustand for client-side state
- **Database**: Drizzle ORM with PostgreSQL driver
- **Development**: Vite, TypeScript, ESLint configuration

### Audio System
- Browser native Audio API for sound effects
- Sound files for card interactions and achievements
- Mute/unmute functionality with persistent preferences

### 3D Graphics Support
- React Three Fiber ecosystem for future 3D enhancements
- GLSL shader support for advanced visual effects
- Asset loading support for 3D models and textures

## Deployment Strategy

### Development Environment
- Vite dev server with hot module replacement
- TypeScript compilation with strict mode
- Database migrations managed through Drizzle Kit

### Production Build
- Vite build process creates optimized static assets
- Server-side rendering support for improved SEO
- Asset optimization for 3D models and audio files

### Database Management
- PostgreSQL with connection pooling
- Migration system for schema updates
- Environment-based configuration

## Changelog

Changelog:
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.