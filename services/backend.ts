
import { User } from '../types';

// Simulating a backend database using LocalStorage
const DB_USERS_KEY = 'flappy_quiz_users_db';
const DB_SESSION_KEY = 'flappy_quiz_session';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const backend = {
  // Simulate Google Sign In
  signInWithGoogle: async (): Promise<User> => {
    await delay(1200); // Fake network latency

    // Simulate a successful Google Auth response
    const mockGoogleUser = {
      googleId: `g_${Math.random().toString(36).substr(2, 9)}`,
      name: "Student Player",
      email: "student@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    };

    // Check if user exists in our "DB", if not, sign them up
    const users = JSON.parse(localStorage.getItem(DB_USERS_KEY) || '{}');
    let user = Object.values(users).find((u: any) => u.email === mockGoogleUser.email) as User | undefined;

    if (!user) {
      // Sign Up
      user = {
        id: mockGoogleUser.googleId,
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        avatar: mockGoogleUser.avatar,
        highScore: 0,
        joinedAt: Date.now()
      };
      users[user.id] = user;
      localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    }

    // Set Session
    localStorage.setItem(DB_SESSION_KEY, user.id);
    return user;
  },

  // Get Current Session
  getSession: async (): Promise<User | null> => {
    await delay(500);
    const userId = localStorage.getItem(DB_SESSION_KEY);
    if (!userId) return null;

    const users = JSON.parse(localStorage.getItem(DB_USERS_KEY) || '{}');
    return users[userId] || null;
  },

  // Sign Out
  signOut: async (): Promise<void> => {
    await delay(300);
    localStorage.removeItem(DB_SESSION_KEY);
  },

  // Update High Score
  updateScore: async (userId: string, score: number): Promise<User> => {
    const users = JSON.parse(localStorage.getItem(DB_USERS_KEY) || '{}');
    const user = users[userId];
    
    if (user && score > user.highScore) {
      user.highScore = score;
      users[userId] = user;
      localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
      return user;
    }
    
    return user || null;
  }
};
