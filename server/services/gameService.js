import { query } from '../config/database.js';

export class GameService {
  // Record a game result and update player stats
  static async recordGameResult(playerId, gameData) {
    const { 
      result, 
      betAmount, 
      payoutAmount, 
      playerHandValue, 
      dealerHandValue, 
      isBlackjack = false 
    } = gameData;

    try {
      const gameResult = await query(`
        INSERT INTO games (
          player_id, result, bet_amount, payout_amount, 
          player_hand_value, dealer_hand_value, is_blackjack
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        playerId, result, betAmount, payoutAmount, 
        playerHandValue, dealerHandValue, isBlackjack
      ]);

      return gameResult.rows[0];
    } catch (error) {
      throw new Error(`Failed to record game result: ${error.message}`);
    }
  }

  // Get player statistics
  static async getPlayerStats(playerId) {
    try {
      const result = await query(`
        SELECT 
          total_wins, 
          total_games, 
          total_earnings,
          CASE 
            WHEN total_games > 0 THEN ROUND((total_wins::decimal / total_games * 100), 2)
            ELSE 0 
          END as win_rate
        FROM players 
        WHERE id = $1
      `, [playerId]);

      if (result.rows.length === 0) {
        throw new Error('Player not found');
      }

      const stats = result.rows[0];
      return {
        totalWins: stats.total_wins,
        totalGames: stats.total_games,
        totalEarnings: parseFloat(stats.total_earnings),
        winRate: parseFloat(stats.win_rate)
      };
    } catch (error) {
      throw new Error(`Failed to get player stats: ${error.message}`);
    }
  }

  // Calculate result type from game outcome
  static calculateGameResult(playerHand, dealerHand, playerValue, dealerValue, isBust) {
    if (isBust) {
      return 'BUST';
    }

    // Check for blackjack (21 with 2 cards)
    if (playerHand.length === 2 && playerValue === 21) {
      if (dealerHand.length === 2 && dealerValue === 21) {
        return 'PUSH'; // Both have blackjack
      }
      return 'BLACKJACK';
    }

    // Dealer busted
    if (dealerValue > 21) {
      return 'WIN';
    }

    // Compare values
    if (playerValue > dealerValue) {
      return 'WIN';
    } else if (playerValue < dealerValue) {
      return 'LOSE';
    } else {
      return 'PUSH';
    }
  }

  // Calculate payout based on result and bet
  static calculatePayout(betAmount, result) {
    switch (result) {
      case 'BLACKJACK':
        return betAmount * 2.5; // 3:2 payout
      case 'WIN':
        return betAmount * 2; // 1:1 payout
      case 'PUSH':
        return betAmount; // Return original bet
      case 'LOSE':
      case 'BUST':
        return 0;
      default:
        return 0;
    }
  }

  // Get top players for leaderboard
  static async getTopPlayers(limit = 3) {
    try {
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
          END as win_rate
        FROM players 
        WHERE total_games > 0
        ORDER BY total_wins DESC, total_earnings DESC, created_at ASC
        LIMIT $1
      `, [limit]);

      return result.rows.map((player, index) => ({
        rank: index + 1,
        id: player.id,
        username: player.username,
        totalWins: player.total_wins,
        totalGames: player.total_games,
        totalEarnings: parseFloat(player.total_earnings),
        winRate: parseFloat(player.win_rate)
      }));
    } catch (error) {
      throw new Error(`Failed to get top players: ${error.message}`);
    }
  }

  // Get recent games for a player
  static async getRecentGames(playerId, limit = 10) {
    try {
      const result = await query(`
        SELECT 
          id, result, bet_amount, payout_amount, 
          player_hand_value, dealer_hand_value, is_blackjack, created_at
        FROM games 
        WHERE player_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [playerId, limit]);

      return result.rows.map(game => ({
        id: game.id,
        result: game.result,
        betAmount: parseFloat(game.bet_amount),
        payoutAmount: parseFloat(game.payout_amount),
        playerHandValue: game.player_hand_value,
        dealerHandValue: game.dealer_hand_value,
        isBlackjack: game.is_blackjack,
        createdAt: game.created_at
      }));
    } catch (error) {
      throw new Error(`Failed to get recent games: ${error.message}`);
    }
  }

  // Validate player exists
  static async validatePlayer(playerId) {
    try {
      const result = await query('SELECT id FROM players WHERE id = $1', [playerId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to validate player: ${error.message}`);
    }
  }
}

export default GameService;