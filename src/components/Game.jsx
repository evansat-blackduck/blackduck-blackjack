import React, { useState, useCallback, useEffect } from 'react';
import Player from './Player';
import Hand from './Hand';
import { 
  createDeck, 
  shuffleDeck, 
  dealCard, 
  dealInitialCards 
} from '../utils/deck';
import {
  calculateHandValue,
  isBlackjack,
  isBust,
  shouldDealerHit,
  compareHands,
  calculatePayout,
  revealDealerCard
} from '../utils/blackjack';
import { 
  GAME_STATES, 
  PLAYER_ACTIONS, 
  HAND_RESULTS,
  MAX_PLAYERS 
} from '../constants/cards';
import './Game.css';

const Game = () => {
  const [numPlayers, setNumPlayers] = useState(1);
  const [gameState, setGameState] = useState(GAME_STATES.WAITING);
  const [deck, setDeck] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [message, setMessage] = useState('Welcome to Blackjack! Select number of players to start.');

  // Initialize players
  const initializePlayers = useCallback((count) => {
    const newPlayers = Array(count).fill(null).map((_, index) => ({
      id: index,
      name: `Player ${index + 1}`,
      hand: [],
      bet: 0,
      balance: 1000,
      status: null
    }));
    setPlayers(newPlayers);
  }, []);

  // Start a new game
  const startNewGame = useCallback(() => {
    if (numPlayers < 1 || numPlayers > MAX_PLAYERS) return;
    
    initializePlayers(numPlayers);
    setGameState(GAME_STATES.BETTING);
    setMessage('Place your bets!');
    setCurrentPlayerIndex(0);
  }, [numPlayers, initializePlayers]);

  // Handle bet placement
  const placeBet = useCallback((playerIndex, amount) => {
    setPlayers(prev => {
      const updated = [...prev];
      const player = updated[playerIndex];
      if (amount > 0 && amount <= player.balance) {
        player.bet = amount;
        player.balance -= amount;
      }
      return updated;
    });
  }, []);

  // Start dealing cards
  const startDealing = useCallback(() => {
    // Create and shuffle deck
    const newDeck = shuffleDeck(createDeck());
    
    // Deal initial cards
    const { dealer, players: playerHands } = dealInitialCards(newDeck, numPlayers);
    
    setDeck(newDeck);
    setDealerHand(dealer);
    setPlayers(prev => prev.map((player, index) => ({
      ...player,
      hand: playerHands[index],
      status: HAND_RESULTS.PLAYING
    })));
    
    setGameState(GAME_STATES.PLAYING);
    setCurrentPlayerIndex(0);
  }, [numPlayers]);

  // Check for initial blackjacks after dealing
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING && players.length > 0) {
      setPlayers(prev => prev.map(player => {
        if (player.hand.length === 2 && isBlackjack(player.hand)) {
          return { ...player, status: HAND_RESULTS.BLACKJACK };
        }
        return player;
      }));
    }
  }, [gameState]);

  // Calculate game results
  const calculateResults = useCallback((finalDealerHand) => {
    setPlayers(prev => prev.map(player => {
      if (player.status === HAND_RESULTS.BUST) {
        return player; // Already busted
      }
      
      const result = compareHands(player.hand, finalDealerHand);
      const payout = calculatePayout(player.bet, result);
      
      return {
        ...player,
        status: result,
        balance: player.balance + payout
      };
    }));
    
    setGameState(GAME_STATES.GAME_OVER);
    setMessage('Game Over! Click "New Round" to play again.');
  }, []);

  // Play dealer's hand
  const playDealerHand = useCallback(() => {
    // First reveal the dealer's hidden card
    const revealedHand = revealDealerCard(dealerHand);
    setDealerHand(revealedHand);
    
    // Use setTimeout to allow the UI to update before proceeding
    setTimeout(() => {
      let currentDeck = [...deck];
      let currentDealerHand = [...revealedHand];
      
      const dealerDrawLoop = () => {
        if (shouldDealerHit(currentDealerHand)) {
          // Dealer needs to hit
          const card = dealCard(currentDeck, true);
          currentDealerHand = [...currentDealerHand, card];
          
          // Update state
          setDeck(currentDeck);
          setDealerHand(currentDealerHand);
          
          // Continue drawing after a delay
          setTimeout(dealerDrawLoop, 1000);
        } else {
          // Dealer is done, calculate results
          setTimeout(() => calculateResults(currentDealerHand), 500);
        }
      };
      
      // Start the dealer draw loop
      dealerDrawLoop();
    }, 1500);
  }, [deck, dealerHand, calculateResults]);

  // Move to next player
  const moveToNextPlayer = useCallback(() => {
    const nextIndex = currentPlayerIndex + 1;
    
    if (nextIndex < numPlayers) {
      setCurrentPlayerIndex(nextIndex);
    } else {
      // All players done, dealer's turn
      setGameState(GAME_STATES.DEALER_TURN);
      setTimeout(() => playDealerHand(), 1000);
    }
  }, [currentPlayerIndex, numPlayers, playDealerHand]);

  // Handle player actions
  const handlePlayerAction = useCallback((playerIndex, action) => {
    const player = players[playerIndex];
    const updatedDeck = [...deck];
    
    switch (action) {
      case PLAYER_ACTIONS.HIT: {
        const card = dealCard(updatedDeck, true);
        const newHand = [...player.hand, card];
        
        setDeck(updatedDeck);
        setPlayers(prev => {
          const updated = [...prev];
          updated[playerIndex] = {
            ...updated[playerIndex],
            hand: newHand,
            status: isBust(newHand) ? HAND_RESULTS.BUST : HAND_RESULTS.PLAYING
          };
          return updated;
        });
        
        // Check if busted
        if (isBust(newHand)) {
          setTimeout(() => moveToNextPlayer(), 1000);
        }
        break;
      }
      
      case PLAYER_ACTIONS.STAND: {
        setPlayers(prev => {
          const updated = [...prev];
          updated[playerIndex] = {
            ...updated[playerIndex],
            status: HAND_RESULTS.PLAYING
          };
          return updated;
        });
        moveToNextPlayer();
        break;
      }
      
      case PLAYER_ACTIONS.DOUBLE_DOWN: {
        const card = dealCard(updatedDeck, true);
        const newHand = [...player.hand, card];
        
        setDeck(updatedDeck);
        setPlayers(prev => {
          const updated = [...prev];
          updated[playerIndex] = {
            ...updated[playerIndex],
            hand: newHand,
            bet: updated[playerIndex].bet * 2,
            balance: updated[playerIndex].balance - updated[playerIndex].bet,
            status: isBust(newHand) ? HAND_RESULTS.BUST : HAND_RESULTS.PLAYING
          };
          return updated;
        });
        
        setTimeout(() => moveToNextPlayer(), 1000);
        break;
      }
    }
  }, [players, deck, moveToNextPlayer]);

  // Reset for new round
  const newRound = useCallback(() => {
    setDealerHand([]);
    setPlayers(prev => prev.map(player => ({
      ...player,
      hand: [],
      bet: 0,
      status: null
    })));
    setCurrentPlayerIndex(0);
    setGameState(GAME_STATES.BETTING);
    setMessage('Place your bets!');
  }, []);

  return (
    <div className="game">
      <h1 className="game-title">♠♥ Blackjack ♦♣</h1>
      
      {gameState === GAME_STATES.WAITING && (
        <div className="game-setup">
          <div className="player-select">
            <label htmlFor="num-players">Number of Players:</label>
            <select 
              id="num-players"
              value={numPlayers} 
              onChange={(e) => setNumPlayers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <button className="start-btn" onClick={startNewGame}>
            Start Game
          </button>
        </div>
      )}

      {gameState === GAME_STATES.BETTING && (
        <div className="betting-phase">
          <h2>{message}</h2>
          <div className="betting-controls">
            {players.map((player, index) => (
              <div key={player.id} className="player-bet">
                <h3>{player.name}</h3>
                <p>Balance: ${player.balance}</p>
                <input
                  type="number"
                  min="10"
                  max={player.balance}
                  step="10"
                  placeholder="Enter bet"
                  onChange={(e) => placeBet(index, Number(e.target.value))}
                />
                <p>Bet: ${player.bet}</p>
              </div>
            ))}
          </div>
          <button 
            className="deal-btn"
            onClick={startDealing}
            disabled={!players.every(p => p.bet > 0)}
          >
            Deal Cards
          </button>
        </div>
      )}

      {(gameState === GAME_STATES.PLAYING || 
        gameState === GAME_STATES.DEALER_TURN || 
        gameState === GAME_STATES.GAME_OVER) && (
        <div className="game-table">
          <div className="dealer-section">
            <Hand 
              cards={dealerHand} 
              isDealer={true} 
              label="Dealer" 
            />
          </div>

          <div className="players-section">
            {players.map((player, index) => (
              <Player
                key={player.id}
                player={player}
                playerIndex={index}
                isCurrentPlayer={currentPlayerIndex === index}
                onAction={handlePlayerAction}
                gameState={gameState}
                canPerformActions={gameState === GAME_STATES.PLAYING}
              />
            ))}
          </div>
        </div>
      )}

      {gameState === GAME_STATES.GAME_OVER && (
        <div className="game-over">
          <h2>{message}</h2>
          <button className="new-round-btn" onClick={newRound}>
            New Round
          </button>
          <button className="new-game-btn" onClick={() => setGameState(GAME_STATES.WAITING)}>
            New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;