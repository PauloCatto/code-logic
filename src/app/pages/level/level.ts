import { Component, signal, inject, OnInit, OnDestroy, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FeedbackService } from '../../core/services/feedback';
import { LoadingService } from '../../core/services/loading';
import { ProfileService } from '../../core/services/profile';
import { Position } from '../../models/level.model';

@Component({
  selector: 'app-level',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './level.html',
})
export class Level implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private feedback = inject(FeedbackService);
  private loading = inject(LoadingService);
  public profileService = inject(ProfileService);
  private routeSub?: Subscription;

  currentLevelId = signal(1);
  playerProfile = this.profileService.getProfile();
  commands: WritableSignal<string[]> = signal([]);
  robotPosition: WritableSignal<Position> = signal({ x: 0, y: 0 });
  mapGrid: WritableSignal<number[][]> = signal([]);
  isRunning = signal(false);
  levelCompleted = signal(false);
  executedIndex: number = 0;

  private lastDir: 'baixo' | 'direita' | 'esquerda' = 'direita';

  ngOnInit(): void {
    this.loading.stop();
    this.routeSub = this.route.params.subscribe((params) => {
      const id = Number(params['id'] || 1);
      this.currentLevelId.set(id);
      this.loadLevelData(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadLevelData(id: number): void {
    this.resetState();
    const levels: Record<number, number[][]> = {
      1: [
        [2, 2, 1, 1, 1],
        [1, 2, 2, 1, 1],
        [1, 1, 2, 1, 1],
        [1, 1, 2, 2, 1],
        [1, 1, 1, 2, 3],
      ],
      2: [
        [2, 2, 1, 1, 1],
        [1, 2, 1, 1, 1],
        [1, 0, 1, 1, 1],
        [1, 2, 1, 1, 1],
        [1, 2, 2, 2, 3],
      ],
      3: [
        [2, 2, 2, 2, 2],
        [1, 1, 1, 1, 2],
        [2, 2, 2, 2, 2],
        [2, 1, 1, 1, 1],
        [2, 2, 2, 2, 3],
      ],
      4: [
        [2, 2, 0, 2, 2],
        [1, 2, 1, 2, 1],
        [2, 2, 2, 2, 1],
        [2, 0, 1, 2, 3],
        [2, 2, 1, 1, 1],
      ],
    };
    this.mapGrid.set(levels[id] || levels[1]);
  }

  addCommand(cmd: string): void {
    if (!this.isRunning() && !this.levelCompleted()) this.commands.update((l) => [...l, cmd]);
  }

  async runSequence(): Promise<void> {
    if (this.commands().length === 0) return;
    this.isRunning.set(true);

    let curX = this.robotPosition().x;
    let curY = this.robotPosition().y;
    const sequence = this.commands();

    for (let i = this.executedIndex; i < sequence.length; i++) {
      const cmd = sequence[i];
      let nextX = curX;
      let nextY = curY;

      if (cmd === 'baixo') {
        nextY += 1;
        this.lastDir = 'baixo';
      } else if (cmd === 'direita') {
        nextX += 1;
        this.lastDir = 'direita';
      } else if (cmd === 'esquerda') {
        nextX -= 1;
        this.lastDir = 'esquerda';
      } else if (cmd === 'pular') {
        if (this.lastDir === 'baixo') nextY += 2;
        else if (this.lastDir === 'direita') nextX += 2;
        else if (this.lastDir === 'esquerda') nextX -= 2;
      }

      if (!this.checkMove(nextX, nextY)) {
        await this.feedback.showError();
        this.resetState();
        this.executedIndex = 0;
        return;
      }

      curX = nextX;
      curY = nextY;
      this.robotPosition.set({ x: curX, y: curY });
      this.executedIndex = i + 1;

      await new Promise((r) => setTimeout(r, 600));

      if (this.mapGrid()[curY][curX] === 3) {
        this.levelCompleted.set(true);
        this.isRunning.set(false);
        return;
      }
    }

    this.isRunning.set(false);
  }

  finish(): void {
    const id = this.currentLevelId();
    this.loading.start();

    setTimeout(() => {
      this.router.navigate(id === 1 ? ['/avatar'] : ['/map']);
    }, 500);
  }

  checkMove(x: number, y: number): boolean {
    const grid = this.mapGrid();
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return false;
    return grid[y][x] === 2 || grid[y][x] === 3;
  }

  resetState(): void {
    this.robotPosition.set({ x: 0, y: 0 });
    this.commands.set([]);
    this.executedIndex = 0;
    this.isRunning.set(false);
    this.levelCompleted.set(false);
    this.lastDir = 'direita';
  }
}
