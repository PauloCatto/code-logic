import { Injectable, signal, computed } from '@angular/core';
import { Level } from '../../models/level.model';

export type UserMode = 'child' | 'adult';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  public mode = signal<UserMode>('child');
  public isAuthenticated = signal<boolean>(false);
  public playerName = signal<string>('Jogador');
  public selectedAvatar = signal<string>('🤖');

  public levels = signal<Level[]>([
    { id: 1, status: 'unlocked' },
    { id: 2, status: 'locked' },
    { id: 3, status: 'locked' },
    { id: 4, status: 'locked' },
    { id: 5, status: 'locked' },
  ]);

  public adultName = signal<string | null>(null);
  public adultEmail = signal<string | null>(null);

  isAdult = computed(() => this.mode() === 'adult');
  isChild = computed(() => this.mode() === 'child');

  setChildMode(): void {
    this.mode.set('child');
  }

  setAdultMode(): void {
    this.mode.set('adult');
  }

  authenticateAdult(data: { name?: string; email: string }): void {
    this.adultName.set(data.name ?? null);
    this.adultEmail.set(data.email);
    this.isAuthenticated.set(true);
    this.setAdultMode();
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.adultName.set(null);
    this.adultEmail.set(null);
    this.setChildMode();
  }

  getProfile(): { name: string; avatar: string } {
    return {
      name: this.playerName(),
      avatar: this.selectedAvatar(),
    };
  }

  setProfile(data: { name: string; avatar: string }): void {
    this.playerName.set(data.name);
    this.selectedAvatar.set(data.avatar);
  }

  completeLevel(levelId: number): void {
    this.levels.update((currentLevels) =>
      currentLevels.map((level) => {
        if (level.id === levelId) {
          return { ...level, status: 'completed' };
        }

        if (level.id === levelId + 1 && level.status === 'locked') {
          return { ...level, status: 'unlocked' };
        }

        return level;
      })
    );
  }

  isUnlocked(levelId: number): boolean {
    return this.levels().some(
      (l) => l.id === levelId && (l.status === 'unlocked' || l.status === 'completed')
    );
  }

  isCompleted(levelId: number): boolean {
    return this.levels().some((l) => l.id === levelId && l.status === 'completed');
  }

  resetProgress(): void {
    this.playerName.set('Jogador');
    this.selectedAvatar.set('🤖');
    this.levels.set([
      { id: 1, status: 'unlocked' },
      { id: 2, status: 'locked' },
      { id: 3, status: 'locked' },
    ]);
  }
}
