import { Injectable, signal, computed, inject } from '@angular/core';
import { Level } from '../../models/level.model';
import { SupabaseService } from './supabase';
import { UserMode, LS_KEYS, ProfileData } from '../../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private supabase = inject(SupabaseService);

  public mode = signal<UserMode>('child');
  public isAuthenticated = signal<boolean>(false);
  public playerName = signal<string>('Jogador');
  public selectedAvatar = signal<string>('🤖');
  public childUserId = signal<string | null>(null);

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

  constructor() {
    this.restoreFromLocalStorage();

    this.hydrateFromSupabase();
  }


  private restoreFromLocalStorage(): void {
    const name = localStorage.getItem(LS_KEYS.playerName);
    const avatar = localStorage.getItem(LS_KEYS.playerAvatar);
    const level = localStorage.getItem(LS_KEYS.unlockedLevel);

    if (name) this.playerName.set(name);
    if (avatar) this.selectedAvatar.set(avatar);
    if (level) this.restoreLevelsFromProgress(Number(level));
  }


  private async hydrateFromSupabase(): Promise<void> {
    const session = await this.supabase.getSession();
    if (!session?.user) return;

    const userId = session.user.id;
    this.childUserId.set(userId);

    const profile = await this.supabase.getProfile(userId);
    if (!profile) return;

    if (profile.player_name) {
      this.playerName.set(profile.player_name);
      localStorage.setItem(LS_KEYS.playerName, profile.player_name);
    }
    if (profile.avatar_icon) {
      this.selectedAvatar.set(profile.avatar_icon);
      localStorage.setItem(LS_KEYS.playerAvatar, profile.avatar_icon);
    }
    if (profile.current_unlocked_level) {
      this.restoreLevelsFromProgress(profile.current_unlocked_level);
      localStorage.setItem(LS_KEYS.unlockedLevel, String(profile.current_unlocked_level));
    }
  }

  private restoreLevelsFromProgress(unlockedLevel: number): void {
    this.levels.update((levels) =>
      levels.map((l) => ({
        ...l,
        status:
          l.id < unlockedLevel
            ? 'completed'
            : l.id === unlockedLevel
              ? 'unlocked'
              : 'locked',
      }))
    );
  }


  async ensureChildSession(): Promise<string | null> {
    let userId = this.childUserId();
    if (userId) return userId;

    const session = await this.supabase.getSession();
    if (session?.user) {
      userId = session.user.id;
    } else {
      const newSession = await this.supabase.signInAnonymously();
      userId = newSession?.user?.id ?? null;
    }

    if (userId) this.childUserId.set(userId);
    return userId;
  }


  setChildMode(): void { this.mode.set('child'); }
  setAdultMode(): void { this.mode.set('adult'); }

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
    return { name: this.playerName(), avatar: this.selectedAvatar() };
  }

  async setProfile(data: { name: string; avatar: string }): Promise<void> {
    this.playerName.set(data.name);
    this.selectedAvatar.set(data.avatar);

    localStorage.setItem(LS_KEYS.playerName, data.name);
    localStorage.setItem(LS_KEYS.playerAvatar, data.avatar);

    const userId = await this.ensureChildSession();
    if (!userId) return;

    await this.supabase.upsertProfile({
      id: userId,
      player_name: data.name,
      avatar_icon: data.avatar,
      role: 'crianca',
    });
  }


  async completeLevel(levelId: number): Promise<void> {
    const nextLevel = levelId + 1;

    this.levels.update((currentLevels) =>
      currentLevels.map((level) => {
        if (level.id === levelId) return { ...level, status: 'completed' };
        if (level.id === nextLevel && level.status === 'locked')
          return { ...level, status: 'unlocked' };
        return level;
      })
    );

    localStorage.setItem(LS_KEYS.unlockedLevel, String(nextLevel));

    const userId = this.childUserId();
    if (userId) {
      await this.supabase.upsertProfile({ id: userId, current_unlocked_level: nextLevel });
    }
  }

  isUnlocked(levelId: number): boolean {
    return this.levels().some(
      (l) => l.id === levelId && (l.status === 'unlocked' || l.status === 'completed')
    );
  }

  isCompleted(levelId: number): boolean {
    return this.levels().some((l) => l.id === levelId && l.status === 'completed');
  }

  async resetProgress(): Promise<void> {
    this.playerName.set('Jogador');
    this.selectedAvatar.set('🤖');
    this.levels.set([
      { id: 1, status: 'unlocked' },
      { id: 2, status: 'locked' },
      { id: 3, status: 'locked' },
      { id: 4, status: 'locked' },
      { id: 5, status: 'locked' },
    ]);

    localStorage.removeItem(LS_KEYS.playerName);
    localStorage.removeItem(LS_KEYS.playerAvatar);
    localStorage.removeItem(LS_KEYS.unlockedLevel);

    const userId = this.childUserId();
    if (userId) {
      await this.supabase.upsertProfile({
        id: userId,
        current_unlocked_level: 1,
        player_name: 'Jogador',
        avatar_icon: '🤖',
      });
    }
  }
}
