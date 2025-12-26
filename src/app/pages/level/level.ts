import {
  Component,
  signal,
  input,
  inject,
  OnInit,
  WritableSignal,
  InputSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FeedbackService } from '../../core/services/feedback';
import { SupabaseService } from '../../core/services/supabase';
import { LoadingService } from '../../core/services/loading';
import { ProfileService } from '../../core/services/profile';
import { Position } from '../../models/level.model';

@Component({
  selector: 'app-level',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './level.html',
})
export class Level implements OnInit {
  id: InputSignal<string | undefined> = input<string>();

  private feedback = inject(FeedbackService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private loading = inject(LoadingService);
  public profileService = inject(ProfileService);

  playerProfile = this.profileService.getProfile();
  commands: WritableSignal<string[]> = signal([]);
  robotPosition: WritableSignal<Position> = signal({ x: 0, y: 0 });
  mapGrid: WritableSignal<number[][]> = signal([]);

  isRunning = signal(false);
  levelCompleted = signal(false);

  ngOnInit(): void {
    this.loading.stop();
    this.loadLevel();
  }

  loadLevel(): void {
    this.mapGrid.set([
      [2, 2, 1, 0, 0],
      [0, 2, 1, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 1, 1, 2, 0],
      [0, 0, 0, 2, 3],
    ]);
  }

  addCommand(cmd: 'frente' | 'direita'): void {
    if (!this.isRunning() && !this.levelCompleted()) this.commands.update((list) => [...list, cmd]);
  }

  async runSequence(): Promise<void> {
    if (this.commands().length === 0) return;

    this.isRunning.set(true);
    let currentPos = { ...this.robotPosition() };
    const sequence = [...this.commands()];

    for (const cmd of sequence) {
      const next: Position = { ...currentPos };

      if (cmd === 'frente') {
        next.y += 1;
      } else if (cmd === 'direita') {
        next.x += 1;
      }

      if (!this.isValidMove(next)) {
        await this.feedback.showError();
        this.fullReset();
        return;
      }

      currentPos = next;
      this.robotPosition.set({ ...next });
      await this.delay(600);

      if (this.isVictory(next)) {
        const levelNum = Number(this.id() || 1);
        this.profileService.completeLevel(levelNum);

        this.levelCompleted.set(true);
        this.isRunning.set(false);
        this.commands.set([]);
        return;
      }
    }

    this.commands.set([]);
    this.isRunning.set(false);
  }

  isValidMove(pos: Position): boolean {
    const grid = this.mapGrid();
    if (pos.y < 0 || pos.y >= grid.length || pos.x < 0 || pos.x >= grid[0].length) return false;
    const cell = grid[pos.y][pos.x];
    return cell === 2 || cell === 3;
  }

  isVictory(pos: Position): boolean {
    return this.mapGrid()[pos.y]?.[pos.x] === 3;
  }

  fullReset(): void {
    this.robotPosition.set({ x: 0, y: 0 });
    this.commands.set([]);
    this.isRunning.set(false);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async goToAvatarSelection(): Promise<void> {
    this.levelCompleted.set(false);
    this.loading.start();
    setTimeout(() => {
      this.router.navigate(['/avatar']);
    }, 900);
  }
}
