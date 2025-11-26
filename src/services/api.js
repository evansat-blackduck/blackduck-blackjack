const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('blackjack_token');
  }

  // Set authorization token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('blackjack_token', token);
    } else {
      localStorage.removeItem('blackjack_token');
    }
  }

  // Get authorization headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Generic request method
  async request(url, options = {}) {
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Player Authentication
  async registerPlayer(username, password) {
    const data = await this.request('/players/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async loginPlayer(username, password) {
    const data = await this.request('/players/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async getPlayerProfile() {
    return this.request('/players/profile');
  }

  logout() {
    this.setToken(null);
  }

  // Game Management
  async recordGame(gameData) {
    return this.request('/games/record', {
      method: 'POST',
      body: JSON.stringify(gameData)
    });
  }

  async getGameHistory(limit = 50, offset = 0) {
    return this.request(`/games/history?limit=${limit}&offset=${offset}`);
  }

  async getGameStats() {
    return this.request('/games/stats');
  }

  // Leaderboard
  async getLeaderboard(limit = 3) {
    return this.request(`/leaderboard?limit=${limit}`);
  }

  async getExtendedLeaderboard(limit = 10, offset = 0) {
    return this.request(`/leaderboard/extended?limit=${limit}&offset=${offset}`);
  }

  async getPlayerRank(playerId) {
    return this.request(`/leaderboard/rank/${playerId}`);
  }

  async getLeaderboardStats() {
    return this.request('/leaderboard/stats');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  registerPlayer,
  loginPlayer,
  getPlayerProfile,
  logout,
  recordGame,
  getGameHistory,
  getGameStats,
  getLeaderboard,
  getExtendedLeaderboard,
  getPlayerRank,
  getLeaderboardStats,
  isAuthenticated,
  healthCheck
} = apiService;