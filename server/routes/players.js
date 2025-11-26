import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const router = express.Router();

// Register a new player
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters and password at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM players WHERE username = $1', [username]);
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(password, saltRounds);

    // Create new player
    const result = await query(
      'INSERT INTO players (username, password_hash) VALUES ($1, $2) RETURNING id, username, total_wins, total_games, total_earnings, created_at',
      [username, passwordHash]
    );

    const newPlayer = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { playerId: newPlayer.id, username: newPlayer.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Player registered successfully',
      player: {
        id: newPlayer.id,
        username: newPlayer.username,
        totalWins: newPlayer.total_wins,
        totalGames: newPlayer.total_games,
        totalEarnings: parseFloat(newPlayer.total_earnings)
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register player' });
  }
});

// Login player
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find player
    const result = await query(
      'SELECT id, username, password_hash, total_wins, total_games, total_earnings FROM players WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const player = result.rows[0];

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, player.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { playerId: player.id, username: player.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      player: {
        id: player.id,
        username: player.username,
        totalWins: player.total_wins,
        totalGames: player.total_games,
        totalEarnings: parseFloat(player.total_earnings)
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get player profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await query(
      'SELECT id, username, total_wins, total_games, total_earnings, created_at FROM players WHERE id = $1',
      [decoded.playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = result.rows[0];

    res.json({
      player: {
        id: player.id,
        username: player.username,
        totalWins: player.total_wins,
        totalGames: player.total_games,
        totalEarnings: parseFloat(player.total_earnings),
        joinedAt: player.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

export default router;