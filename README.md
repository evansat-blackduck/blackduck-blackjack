# BlackDuck BlackJack Game with PostgreSQL Database

A full-stack BlackJack game built with React frontend and Node.js/Express backend, featuring PostgreSQL database integration and a competitive leaderboard system.

## Features

- **Full BlackJack Gameplay**: Complete blackjack implementation with proper rules
- **Database Integration**: PostgreSQL database stores player statistics and game results
- **Player Authentication**: Secure login/registration system with JWT tokens
- **Leaderboard System**: Top 3 players ranked by total wins and earnings
- **Real-time Statistics**: Track wins, losses, earnings, and win rates
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 19.2.0
- CSS3 with modern design
- Fetch API for backend communication

### Backend
- Node.js with Express.js
- PostgreSQL database with pg driver
- JWT authentication
- bcryptjs for password hashing
- CORS enabled for frontend communication

## Prerequisites

Before running this application, make sure you have installed:

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Database Setup

1. Install and start PostgreSQL on your system
2. Create a PostgreSQL user and database:
   ```sql
   -- Connect as postgres user
   CREATE USER blackjack_user WITH PASSWORD 'your_password';
   CREATE DATABASE blackjack_db OWNER blackjack_user;
   GRANT ALL PRIVILEGES ON DATABASE blackjack_db TO blackjack_user;
   ```

3. Update the database configuration in `server/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=blackjack_user
   DB_PASSWORD=your_password
   DB_NAME=blackjack_db
   ```

## Installation and Setup

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your settings:

```bash
cd server
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

### 3. Initialize Database

The database tables will be automatically created when you first run the server:

```bash
cd server
npm run init-db
```

## Running the Application

### Start the Backend Server

```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

The backend server will start on `http://localhost:3001`

### Start the Frontend

In a new terminal window:

```bash
# From project root
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/players/register` - Register new player
- `POST /api/players/login` - Player login
- `GET /api/players/profile` - Get player profile (authenticated)

### Game Management
- `POST /api/games/record` - Record game result (authenticated)
- `GET /api/games/history` - Get player's game history (authenticated)
- `GET /api/games/stats` - Get player statistics (authenticated)

### Leaderboard
- `GET /api/leaderboard` - Get top 3 players
- `GET /api/leaderboard/extended` - Get extended leaderboard with pagination
- `GET /api/leaderboard/rank/:playerId` - Get player's rank
- `GET /api/leaderboard/stats` - Get global statistics

## Game Features

### Authentication System
- **Registration**: Create account with username and password
- **Login**: Secure authentication with JWT tokens
- **Guest Mode**: Play without registration (progress not saved)
- **Profile Management**: View stats and logout

### Leaderboard
- **Top 3 Display**: Shows the highest-ranking players
- **Real-time Updates**: Refreshes automatically after games
- **Statistics**: Win rate, total earnings, and game count
- **Ranking System**: Based on total wins, then total earnings

### Game Recording
- **Single Player Only**: Database recording only works in single-player mode
- **Comprehensive Tracking**: Records bet amount, result, hand values
- **Automatic Updates**: Player statistics updated in real-time
- **Result Types**: WIN, LOSE, BUST, BLACKJACK, PUSH

## Database Schema

### Players Table
- `id` - Primary key
- `username` - Unique player identifier
- `password_hash` - Secure password storage
- `total_wins` - Number of wins
- `total_games` - Total games played
- `total_earnings` - Net earnings/losses
- `created_at` - Registration date

### Games Table
- `id` - Primary key
- `player_id` - Foreign key to players
- `result` - Game outcome (WIN, LOSE, etc.)
- `bet_amount` - Amount wagered
- `payout_amount` - Amount won/lost
- `player_hand_value` - Final hand value
- `dealer_hand_value` - Dealer's final hand value
- `is_blackjack` - Whether player got blackjack
- `created_at` - Game timestamp

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running: `sudo service postgresql status`
2. Check database credentials in `.env` file
3. Ensure database and user exist
4. Check firewall settings for PostgreSQL port (5432)

### Frontend/Backend Communication
1. Verify both servers are running on correct ports
2. Check CORS configuration in `server/server.js`
3. Ensure `FRONTEND_URL` in `.env` matches frontend port

### Authentication Issues
1. Check JWT secret in `.env` file
2. Clear browser localStorage if tokens are corrupted
3. Verify password requirements (6+ characters)

## Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
npm run dev  # Vite development server with HMR
```

### Database Management
```bash
cd server
npm run init-db  # Reinitialize database tables
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.
