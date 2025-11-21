import React from 'react';
import Card from './Card';
import { calculateHandValue } from '../utils/blackjack';
import './Hand.css';

const Hand = ({ cards, isDealer = false, showValue = true, label = '' }) => {
  const handValue = calculateHandValue(cards);
  const showDealerValue = !isDealer || cards.every(card => card.faceUp);

  return (
    <div className="hand">
      {label && <h3 className="hand-label">{label}</h3>}
      <div className="hand-cards">
        {cards.map((card, index) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      {showValue && (
        <div className="hand-value">
          Value: {showDealerValue ? handValue : '?'}
        </div>
      )}
    </div>
  );
};

export default Hand;