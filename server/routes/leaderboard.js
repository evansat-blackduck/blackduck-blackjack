import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get top players leaderboard
router.get('/', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const result = await query(`
      SELECT 
        id,
        username,
        total_wins,
        total_games,
        total_earnings,
        CASE 
          WHEN total_games > 0 THEN ROUND((total_wins::decimal / total_games * 100), 2)
          ELSE 0 
        END as win_rate,
        created_at
      FROM players 
      WHERE total_games > 0
      ORDER BY total_wins DESC, total_earnings DESC, created_at ASC
      LIMIT $1
    `, [limit]);

    const leaderboard = result.rows.map((player, index) => ({
      rank: index + 1,
      id: player.id,
      username: player.username,
      totalWins: player.total_wins,
      totalGames: player.total_games,
      totalEarnings: parseFloat(player.total_earnings),
      winRate: parseFloat(player.win_rate),
      joinedAt: player.created_at
    }));

    res.json({
      leaderboard,
      metadata: {
        totalPlayers: leaderboard.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get extended leaderboard with more players
router.get('/extended', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const result = await query(`
      SELECT 
        id,
        username,
        total_wins,
        total_games,
        total_earnings,
        CASE 
          WHEN total_games > 0 THEN ROUND((total_wins::decimal / total_games * 100), 2)
          ELSE 0 
        END as win_rate,
        created_at
      FROM players 
      WHERE total_games > 0
      ORDER BY total_wins DESC, total_earnings DESC, created_at ASC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM players 
      WHERE total_games > 0
    `);

    const totalPlayers = parseInt(countResult.rows[0].total);

    const leaderboard = result.rows.map((player, index) => ({
      rank: parseInt(offset) + index + 1,
      id: player.id,
      username: player.username,
      totalWins: player.total_wins,
      totalGames: player.total_games,
      totalEarnings: parseFloat(player.total_earnings),
      winRate: parseFloat(player.win_rate),
      joinedAt: player.created_at
    }));

    res.json({
      leaderboard,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalPlayers,
        hasNext: parseInt(offset) + parseInt(limit) < totalPlayers
      },
      metadata: {
        totalPlayers,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Extended leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get extended leaderboard' });
  }
});

// Get player's rank in leaderboard
router.get('/rank/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Get player's current stats
    const playerResult = await query(`
      SELECT username, total_wins, total_games, total_earnings
      FROM players 
      WHERE id = $1
    `, [playerId]);

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // Calculate player's rank
    const rankResult = await query(`
      SELECT COUNT(*) + 1 as rank
      FROM players 
      WHERE total_games > 0 
      AND (
        total_wins > $1 
        OR (total_wins = $1 AND total_earnings > $2)
        OR (total_wins = $1 AND total_earnings = $2 AND id < $3)
      )
    `, [player.total_wins, player.total_earnings, playerId]);

    const rank = parseInt(rankResult.rows[0].rank);

    // Get total number of players with games
    const totalResult = await query(`
      SELECT COUNT(*) as total 
      FROM players 
      WHERE total_games > 0
    `);

    const totalPlayers = parseInt(totalResult.rows[0].total);

    res.json({
      player: {
        id: parseInt(playerId),
        username: player.username,
        totalWins: player.total_wins,
        totalGames: player.total_games,
        totalEarnings: parseFloat(player.total_earnings),
        winRate: player.total_games > 0 ? (player.total_wins / player.total_games * 100).toFixed(2) : '0.00'
      },
      ranking: {
        rank,
        totalPlayers,
        percentile: totalPlayers > 0 ? ((totalPlayers - rank + 1) / totalPlayers * 100).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    console.error('Player rank error:', error);
    res.status(500).json({ error: 'Failed to get player rank' });
  }
});

// Get leaderboard statistics
router.get('/stats', async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(DISTINCT id) as total_players,
        SUM(total_games) as total_games_played,
        AVG(total_wins) as avg_wins_per_player,
        MAX(total_wins) as highest_wins,
        SUM(total_earnings) as total_earnings_all_players,
        AVG(CASE WHEN total_games > 0 THEN (total_wins::decimal / total_games * 100) ELSE 0 END) as avg_win_rate
      FROM players 
      WHERE total_games > 0
    `);

    const stats = statsResult.rows[0];

    res.json({
      globalStats: {
        totalPlayers: parseInt(stats.total_players) || 0,
        totalGamesPlayed: parseInt(stats.total_games_played) || 0,
        averageWinsPerPlayer: stats.avg_wins_per_player ? parseFloat(stats.avg_wins_per_player).toFixed(2) : '0.00',
        highestWins: parseInt(stats.highest_wins) || 0,
        totalEarningsAllPlayers: stats.total_earnings_all_players ? parseFloat(stats.total_earnings_all_players).toFixed(2) : '0.00',
        averageWinRate: stats.avg_win_rate ? parseFloat(stats.avg_win_rate).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    console.error('Leaderboard stats error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard statistics' });
  }
});

export default router;