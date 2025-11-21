import React from 'react';
import './Card.css';

const Card = ({ card, hidden = false }) => {
  const getSuitColor = (suit) => {
    return ['♥', '♦'].includes(suit) ? 'red' : 'black';
  };

  if (hidden || !card.faceUp) {
    return (
      <div className="card card-back">
        <div className="card-pattern"></div>
      </div>
    );
  }

  return (
    <div className={`card ${getSuitColor(card.suit)}`}>
      <div className="card-corner top-left">
        <div className="card-rank">{card.rank}</div>
        <div className="card-suit">{card.suit}</div>
      </div>
      <div className="card-center">
        <div className="card-suit-large">{card.suit}</div>
      </div>
      <div className="card-corner bottom-right">
        <div className="card-rank">{card.rank}</div>
        <div className="card-suit">{card.suit}</div>
      </div>
    </div>
  );
};

export default Card;