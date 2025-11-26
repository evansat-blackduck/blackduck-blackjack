import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
  // Connect to PostgreSQL as admin to create database
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    await adminClient.connect();
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'blackjack_db';
    try {
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`Database ${dbName} already exists`);
      } else {
        throw error;
      }
    }
    
    await adminClient.end();
  } catch (error) {
    console.error('Error creating database:', error);
    await adminClient.end();
    throw error;
  }
};

const createTables = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'blackjack_db'
  });

  try {
    await client.connect();

    // Create players table
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        total_wins INTEGER DEFAULT 0,
        total_games INTEGER DEFAULT 0,
        total_earnings DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES players(id),
        result VARCHAR(20) NOT NULL, -- 'WIN', 'LOSE', 'PUSH', 'BLACKJACK'
        bet_amount DECIMAL(10,2) NOT NULL,
        payout_amount DECIMAL(10,2) NOT NULL,
        player_hand_value INTEGER NOT NULL,
        dealer_hand_value INTEGER NOT NULL,
        is_blackjack BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_players_total_wins ON players(total_wins DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_games_player_id ON games(player_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
    `);

    // Create trigger to update player stats when game is added
    await client.query(`
      CREATE OR REPLACE FUNCTION update_player_stats()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE players SET
          total_games = total_games + 1,
          total_wins = CASE WHEN NEW.result IN ('WIN', 'BLACKJACK') THEN total_wins + 1 ELSE total_wins END,
          total_earnings = total_earnings + (NEW.payout_amount - NEW.bet_amount),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.player_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_player_stats ON games;
      CREATE TRIGGER trigger_update_player_stats
        AFTER INSERT ON games
        FOR EACH ROW
        EXECUTE FUNCTION update_player_stats();
    `);

    console.log('Database tables created successfully');
    await client.end();
  } catch (error) {
    console.error('Error creating tables:', error);
    await client.end();
    throw error;
  }
};

const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    await createDatabase();
    await createTables();
    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export { initDatabase };