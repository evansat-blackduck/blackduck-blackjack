// Card suits and ranks for a standard deck
export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Card values for blackjack
export const CARD_VALUES = {
  'A': [1, 11], // Ace can be 1 or 11
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10
};

// Maximum number of players (excluding dealer)
export const MAX_PLAYERS = 5;

// Game states
export const GAME_STATES = {
  WAITING: 'WAITING',
  BETTING: 'BETTING',
  DEALING: 'DEALING',
  PLAYING: 'PLAYING',
  DEALER_TURN: 'DEALER_TURN',
  GAME_OVER: 'GAME_OVER'
};

// Player actions
export const PLAYER_ACTIONS = {
  HIT: 'HIT',
  STAND: 'STAND',
  DOUBLE_DOWN: 'DOUBLE_DOWN',
  SPLIT: 'SPLIT',
  INSURANCE: 'INSURANCE'
};

// Hand results
export const HAND_RESULTS = {
  BLACKJACK: 'BLACKJACK',
  BUST: 'BUST',
  WIN: 'WIN',
  LOSE: 'LOSE',
  PUSH: 'PUSH', // Tie
  PLAYING: 'PLAYING'
};