export interface Position {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  status: LevelStatus;
}

export type LevelStatus = 'locked' | 'unlocked' | 'completed';
