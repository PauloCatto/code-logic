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

  ngOnInit(): void {
    this.loading.stop();
    this.routeSub = this.route.params.subscribe((params) => {
      const id = Number(params['id'] || 1);
      this.currentLevelId.set(id);
      this.setupNewLevel(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  setupNewLevel(id: number): void {
    this.resetState();
    if (id === 1) {
      this.mapGrid.set([
        [2, 1, 1, 1, 1],
        [2, 2, 2, 1, 1],
        [1, 1, 2, 1, 1],
        [1, 1, 2, 2, 1],
        [1, 1, 1, 2, 3],
      ]);
    } else {
      this.mapGrid.set([
        [2, 1, 1, 1, 1], // Início (0,0)
        [0, 1, 1, 1, 1], // Buraco (exige PULAR)
        [2, 2, 1, 1, 1], // Plataforma
        [1, 0, 1, 1, 1], // Outro buraco
        [1, 2, 2, 2, 3], // Caminho final
      ]);
    }
  }

  addCommand(cmd: string): void {
    if (!this.isRunning() && !this.levelCompleted()) {
      this.commands.update((list) => [...list, cmd]);
    }
  }

  async runSequence(): Promise<void> {
    if (this.commands().length === 0) return;
    this.isRunning.set(true);

    let currentPos = { ...this.robotPosition() };

    for (const cmd of this.commands()) {
      let next: Position = { ...currentPos };

      if (cmd === 'baixo') next.y += 1;
      else if (cmd === 'direita') next.x += 1;
      else if (cmd === 'pular') next.y += 2;

      if (!this.isValidMove(next)) {
        await this.feedback.showError();
        this.resetState();
        return;
      }

      currentPos = next;
      this.robotPosition.set({ ...next });
      await this.delay(500);

      if (this.isVictory(next)) {
        this.profileService.completeLevel(this.currentLevelId());
        this.levelCompleted.set(true);
        this.isRunning.set(false);
        return;
      }
    }
    this.isRunning.set(false);
    this.commands.set([]);
  }

  isValidMove(pos: Position): boolean {
    const grid = this.mapGrid();
    if (pos.y < 0 || pos.y >= grid.length || pos.x < 0 || pos.x >= grid[0].length) return false;

    const cell = grid[pos.y][pos.x];
    return cell === 2 || cell === 3;
  }

  isVictory = (pos: Position) => this.mapGrid()[pos.y]?.[pos.x] === 3;

  resetState(): void {
    this.robotPosition.set({ x: 0, y: 0 });
    this.commands.set([]);
    this.isRunning.set(false);
    this.levelCompleted.set(false);
  }

  delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async finish(): Promise<void> {
    this.loading.start();
    setTimeout(() => this.router.navigate([this.currentLevelId() === 1 ? '/avatar' : '/map']), 800);
  }
}
