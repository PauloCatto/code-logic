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

  private lastDir: 'baixo' | 'direita' | 'esquerda' = 'direita';

  ngOnInit(): void {
    this.loading.stop();
    this.routeSub = this.route.params.subscribe((params) => {
      const id = Number(params['id'] || 1);
      this.currentLevelId.set(id);
      this.loadLevelData(id);
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  loadLevelData(id: number) {
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
        [2, 2, 1, 1, 1], // (0,0) Início
        [1, 2, 1, 1, 1], // (1,1) Ponto de Pulo
        [1, 0, 1, 1, 1], // (1,2) Buraco
        [1, 2, 1, 1, 1], // (1,3) Chegada do Pulo
        [1, 2, 2, 2, 3], // (1,4) Baixo agora funciona e leva para o caminho da estrela
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

  addCommand(cmd: string) {
    if (!this.isRunning() && !this.levelCompleted()) {
      this.commands.update((l) => [...l, cmd]);
    }
  }

  async runSequence(): Promise<void> {
    if (this.commands().length === 0) return;
    this.isRunning.set(true);

    let curX = this.robotPosition().x;
    let curY = this.robotPosition().y;

    for (const cmd of this.commands()) {
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

      if (this.checkMove(nextX, nextY)) {
        curX = nextX;
        curY = nextY;
        this.robotPosition.set({ x: curX, y: curY });
        await new Promise((r) => setTimeout(r, 600));

        if (this.mapGrid()[curY][curX] === 3) {
          const nextLevel = this.currentLevelId() + 1;
          const saved = localStorage.getItem('unlockedLevel');
          if (!saved || nextLevel > Number(saved)) {
            localStorage.setItem('unlockedLevel', nextLevel.toString());
          }

          this.profileService.completeLevel(this.currentLevelId());
          this.levelCompleted.set(true);
          this.isRunning.set(false);
          return;
        }
      } else {
        await this.feedback.showError();
        this.resetState();
        return;
      }
    }
    this.isRunning.set(false);
  }

  async finish(): Promise<void> {
    const id = this.currentLevelId();
    this.loading.start();

    setTimeout(() => {
      if (id === 1) {
        this.router.navigate(['/avatar']);
      } else {
        this.router.navigate(['/map']);
      }
    }, 600);
  }
  checkMove(x: number, y: number): boolean {
    const grid = this.mapGrid();
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return false;
    const cell = grid[y][x];
    return cell === 2 || cell === 3;
  }

  resetState(): void {
    this.robotPosition.set({ x: 0, y: 0 });
    this.commands.set([]);
    this.isRunning.set(false);
    this.levelCompleted.set(false);
    this.lastDir = 'direita';
  }
}
