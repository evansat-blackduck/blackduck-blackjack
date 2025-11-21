import { SUITS, RANKS } from '../constants/cards.js';

// Create a single card object
export const createCard = (rank, suit) => ({
  rank,
  suit,
  id: `${rank}${suit}`, // Unique identifier
  faceUp: false
});

// Create a full deck of cards (52 cards)
export const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(rank, suit));
    }
  }
  return deck;
};

// Shuffle the deck using Fisher-Yates algorithm
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal a card from the deck
export const dealCard = (deck, faceUp = true) => {
  if (deck.length === 0) {
    throw new Error('No cards left in deck');
  }
  const card = deck.pop();
  card.faceUp = faceUp;
  return card;
};

// Deal initial cards for blackjack
export const dealInitialCards = (deck, numPlayers) => {
  const hands = {
    dealer: [],
    players: Array(numPlayers).fill(null).map(() => [])
  };

  // Deal two cards to each player and dealer
  for (let i = 0; i < 2; i++) {
    // Deal to players first
    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
      hands.players[playerIndex].push(dealCard(deck, true));
    }
    // Deal to dealer (second card face down)
    hands.dealer.push(dealCard(deck, i === 0));
  }

  return hands;
};