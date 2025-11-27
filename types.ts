
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER', // Moment of crash
  QUIZ = 'QUIZ', // The mandatory knowledge toll
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface QuizConfig {
  sourceText: string;
  isCustom: boolean;
}

export interface ScoreBoard {
  current: number;
  best: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  highScore: number;
  joinedAt: number;
}
