import { CARD_VALUES, HAND_RESULTS } from '../constants/cards.js';

// Calculate the value of a hand
export const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  // Count base values and aces
  for (const card of hand) {
    if (!card.faceUp) continue; // Skip face-down cards
    
    const cardValue = CARD_VALUES[card.rank];
    if (card.rank === 'A') {
      aces++;
      value += 1; // Count ace as 1 initially
    } else if (Array.isArray(cardValue)) {
      value += cardValue[0];
    } else {
      value += cardValue;
    }
  }

  // Optimize aces (use 11 when beneficial)
  while (aces > 0 && value + 10 <= 21) {
    value += 10;
    aces--;
  }

  return value;
};

// Check if hand is blackjack (21 with 2 cards)
export const isBlackjack = (hand) => {
  return hand.length === 2 && calculateHandValue(hand) === 21;
};

// Check if hand is busted
export const isBust = (hand) => {
  return calculateHandValue(hand) > 21;
};

// Check if hand is soft (has an ace counted as 11)
export const isSoftHand = (hand) => {
  const value = calculateHandValue(hand);
  let hardValue = 0;
  
  for (const card of hand) {
    if (!card.faceUp) continue;
    const cardValue = CARD_VALUES[card.rank];
    if (card.rank === 'A') {
      hardValue += 1;
    } else if (Array.isArray(cardValue)) {
      hardValue += cardValue[0];
    } else {
      hardValue += cardValue;
    }
  }
  
  return value !== hardValue;
};

// Determine if dealer should hit
export const shouldDealerHit = (hand) => {
  const value = calculateHandValue(hand);
  // Dealer must hit on 16 or less, and soft 17
  return value < 17 || (value === 17 && isSoftHand(hand));
};

// Compare hands and determine result
export const compareHands = (playerHand, dealerHand) => {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);
  const playerBlackjack = isBlackjack(playerHand);
  const dealerBlackjack = isBlackjack(dealerHand);

  if (isBust(playerHand)) {
    return HAND_RESULTS.BUST;
  }

  if (isBust(dealerHand)) {
    return HAND_RESULTS.WIN;
  }

  if (playerBlackjack && !dealerBlackjack) {
    return HAND_RESULTS.BLACKJACK;
  }

  if (!playerBlackjack && dealerBlackjack) {
    return HAND_RESULTS.LOSE;
  }

  if (playerValue > dealerValue) {
    return HAND_RESULTS.WIN;
  } else if (playerValue < dealerValue) {
    return HAND_RESULTS.LOSE;
  } else {
    return HAND_RESULTS.PUSH;
  }
};

// Calculate payout based on result
export const calculatePayout = (bet, result) => {
  switch (result) {
    case HAND_RESULTS.BLACKJACK:
      return bet * 2.5; // 3:2 payout
    case HAND_RESULTS.WIN:
      return bet * 2; // 1:1 payout
    case HAND_RESULTS.PUSH:
      return bet; // Return original bet
    case HAND_RESULTS.LOSE:
    case HAND_RESULTS.BUST:
      return 0;
    default:
      return 0;
  }
};

// Check if player can double down
export const canDoubleDown = (hand, balance, currentBet) => {
  return hand.length === 2 && balance >= currentBet;
};

// Check if player can split
export const canSplit = (hand, balance, currentBet) => {
  return (
    hand.length === 2 && 
    hand[0].rank === hand[1].rank && 
    balance >= currentBet
  );
};

// Reveal dealer's hidden card
export const revealDealerCard = (dealerHand) => {
  return dealerHand.map(card => ({ ...card, faceUp: true }));
};