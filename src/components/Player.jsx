import React from 'react';
import Hand from './Hand';
import { PLAYER_ACTIONS, HAND_RESULTS } from '../constants/cards';
import './Player.css';

const Player = ({ 
  player, 
  playerIndex, 
  isCurrentPlayer, 
  onAction,
  gameState,
  canPerformActions
}) => {
  const { hand, bet, balance, status, name } = player;
  const isActive = isCurrentPlayer && canPerformActions;

  const handleAction = (action) => {
    if (onAction) {
      onAction(playerIndex, action);
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case HAND_RESULTS.BLACKJACK:
        return 'status-blackjack';
      case HAND_RESULTS.WIN:
        return 'status-win';
      case HAND_RESULTS.LOSE:
      case HAND_RESULTS.BUST:
        return 'status-lose';
      case HAND_RESULTS.PUSH:
        return 'status-push';
      default:
        return '';
    }
  };

  return (
    <div className={`player ${isActive ? 'active' : ''} ${getStatusClass()}`}>
      <div className="player-info">
        <h3>{name || `Player ${playerIndex + 1}`}</h3>
        <div className="player-stats">
          <span>Balance: ${balance}</span>
          {bet > 0 && <span>Bet: ${bet}</span>}
        </div>
      </div>
      
      <Hand cards={hand} showValue={true} />
      
      {status && status !== HAND_RESULTS.PLAYING && (
        <div className={`player-status ${getStatusClass()}`}>
          {status}
        </div>
      )}
      
      {isActive && (
        <div className="player-actions">
          <button 
            className="action-btn hit-btn"
            onClick={() => handleAction(PLAYER_ACTIONS.HIT)}
          >
            Hit
          </button>
          <button 
            className="action-btn stand-btn"
            onClick={() => handleAction(PLAYER_ACTIONS.STAND)}
          >
            Stand
          </button>
          {hand.length === 2 && balance >= bet && (
            <button 
              className="action-btn double-btn"
              onClick={() => handleAction(PLAYER_ACTIONS.DOUBLE_DOWN)}
            >
              Double Down
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Player;