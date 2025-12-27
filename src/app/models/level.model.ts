export interface Position {
  x: number;
  y: number;
}
export interface Level {
  id: number;
  status: LevelStatus;
  unlocked?: boolean;
  top?: string;
  left?: string;
}

export type LevelStatus = 'locked' | 'unlocked' | 'completed';

export type Command = 'frente' | 'direita' | 'pular';
