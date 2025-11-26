import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.playerId = decoded.playerId;
    next();
  });
};

// Record a game result
router.post('/record', authenticateToken, async (req, res) => {
  try {
    const { 
      result, 
      betAmount, 
      payoutAmount, 
      playerHandValue, 
      dealerHandValue, 
      isBlackjack 
    } = req.body;

    // Validate required fields
    if (!result || betAmount === undefined || payoutAmount === undefined || 
        playerHandValue === undefined || dealerHandValue === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: result, betAmount, payoutAmount, playerHandValue, dealerHandValue' 
      });
    }

    // Validate result values
    const validResults = ['WIN', 'LOSE', 'PUSH', 'BLACKJACK', 'BUST'];
    if (!validResults.includes(result)) {
      return res.status(400).json({ 
        error: 'Invalid result. Must be one of: ' + validResults.join(', ') 
      });
    }

    // Record the game
    const gameResult = await query(`
      INSERT INTO games (
        player_id, result, bet_amount, payout_amount, 
        player_hand_value, dealer_hand_value, is_blackjack
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `, [
      req.playerId, 
      result, 
      betAmount, 
      payoutAmount, 
      playerHandValue, 
      dealerHandValue, 
      isBlackjack || false
    ]);

    const game = gameResult.rows[0];

    // Get updated player stats
    const playerResult = await query(`
      SELECT total_wins, total_games, total_earnings 
      FROM players 
      WHERE id = $1
    `, [req.playerId]);

    const playerStats = playerResult.rows[0];

    res.status(201).json({
      message: 'Game recorded successfully',
      game: {
        id: game.id,
        result,
        betAmount: parseFloat(betAmount),
        payoutAmount: parseFloat(payoutAmount),
        playerHandValue,
        dealerHandValue,
        isBlackjack: isBlackjack || false,
        createdAt: game.created_at
      },
      playerStats: {
        totalWins: playerStats.total_wins,
        totalGames: playerStats.total_games,
        totalEarnings: parseFloat(playerStats.total_earnings)
      }
    });
  } catch (error) {
    console.error('Game recording error:', error);
    res.status(500).json({ error: 'Failed to record game' });
  }
});

// Get player's game history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await query(`
      SELECT id, result, bet_amount, payout_amount, 
             player_hand_value, dealer_hand_value, is_blackjack, created_at
      FROM games 
      WHERE player_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [req.playerId, limit, offset]);

    const games = result.rows.map(game => ({
      id: game.id,
      result: game.result,
      betAmount: parseFloat(game.bet_amount),
      payoutAmount: parseFloat(game.payout_amount),
      playerHandValue: game.player_hand_value,
      dealerHandValue: game.dealer_hand_value,
      isBlackjack: game.is_blackjack,
      createdAt: game.created_at
    }));

    res.json({
      games,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: games.length
      }
    });
  } catch (error) {
    console.error('Game history error:', error);
    res.status(500).json({ error: 'Failed to get game history' });
  }
});

// Get game statistics for a player
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN result IN ('WIN', 'BLACKJACK') THEN 1 END) as wins,
        COUNT(CASE WHEN result = 'BLACKJACK' THEN 1 END) as blackjacks,
        COUNT(CASE WHEN result = 'BUST' THEN 1 END) as busts,
        COUNT(CASE WHEN result = 'PUSH' THEN 1 END) as pushes,
        AVG(bet_amount) as avg_bet,
        SUM(payout_amount - bet_amount) as net_earnings,
        MAX(payout_amount - bet_amount) as biggest_win,
        MIN(payout_amount - bet_amount) as biggest_loss
      FROM games 
      WHERE player_id = $1
    `, [req.playerId]);

    const stats = statsResult.rows[0];

    res.json({
      stats: {
        totalGames: parseInt(stats.total_games),
        wins: parseInt(stats.wins),
        losses: parseInt(stats.total_games) - parseInt(stats.wins) - parseInt(stats.pushes),
        blackjacks: parseInt(stats.blackjacks),
        busts: parseInt(stats.busts),
        pushes: parseInt(stats.pushes),
        winRate: stats.total_games > 0 ? (stats.wins / stats.total_games * 100).toFixed(2) : '0.00',
        averageBet: stats.avg_bet ? parseFloat(stats.avg_bet).toFixed(2) : '0.00',
        netEarnings: stats.net_earnings ? parseFloat(stats.net_earnings).toFixed(2) : '0.00',
        biggestWin: stats.biggest_win ? parseFloat(stats.biggest_win).toFixed(2) : '0.00',
        biggestLoss: stats.biggest_loss ? parseFloat(stats.biggest_loss).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    console.error('Game stats error:', error);
    res.status(500).json({ error: 'Failed to get game statistics' });
  }
});

export default router;