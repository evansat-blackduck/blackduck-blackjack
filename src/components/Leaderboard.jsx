import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api.js';
import './Leaderboard.css';

const Leaderboard = ({ isVisible = true }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isVisible) {
      loadLeaderboard();
    }
  }, [isVisible]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getLeaderboard(3);
      setLeaderboard(response.leaderboard || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const formatEarnings = (earnings) => {
    return earnings >= 0 ? `+$${earnings.toFixed(2)}` : `-$${Math.abs(earnings).toFixed(2)}`;
  };

  if (!isVisible) return null;

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3>🏆 Top Players</h3>
        <button 
          className="refresh-btn" 
          onClick={loadLeaderboard}
          disabled={loading}
        >
          {loading ? '🔄' : '↻'}
        </button>
      </div>

      {error && (
        <div className="leaderboard-error">
          {error}
        </div>
      )}

      {loading && (
        <div className="leaderboard-loading">
          Loading leaderboard...
        </div>
      )}

      {!loading && !error && (
        <div className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <div className="no-players">
              No players yet. Be the first to play!
            </div>
          ) : (
            leaderboard.map((player) => (
              <div key={player.id} className={`player-card rank-${player.rank}`}>
                <div className="player-rank">
                  <span className="rank-number">{player.rank}</span>
                  <span className="rank-emoji">{getRankEmoji(player.rank)}</span>
                </div>
                <div className="player-info">
                  <div className="player-name">{player.username}</div>
                  <div className="player-stats">
                    <span className="wins">{player.totalWins} wins</span>
                    <span className="games">/{player.totalGames} games</span>
                    <span className="winrate">({player.winRate.toFixed(1)}%)</span>
                  </div>
                  <div className="player-earnings">
                    {formatEarnings(player.totalEarnings)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="leaderboard-footer">
        <small>Updated in real-time</small>
      </div>
    </div>
  );
};

export default Leaderboard;