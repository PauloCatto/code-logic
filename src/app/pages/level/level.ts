import { Component, signal, input, inject, OnInit, WritableSignal, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback';
import { SupabaseService } from '../../services/supabase';
import { SweetAlertResult } from 'sweetalert2';

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-level',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './level.html'
})
export class Level implements OnInit {
  id: InputSignal<string | undefined> = input<string>();
  
  private feedbackService: FeedbackService = inject(FeedbackService);
  private supabaseService: SupabaseService = inject(SupabaseService);
  private router: Router = inject(Router);

  commands: WritableSignal<string[]> = signal<string[]>([]);
  robotPosition: WritableSignal<Position> = signal<Position>({ x: 0, y: 0 });
  isRunning: WritableSignal<boolean> = signal<boolean>(false);
  mapGrid: WritableSignal<number[][]> = signal<number[][]>([]);

  ngOnInit(): void {
    this.loadLevel();
  }

  async loadLevel(): Promise<void> {
    await this.supabaseService.getLevelData(this.id() || '1');
    this.mapGrid.set([
      [2, 2, 1, 0, 0],
      [0, 2, 1, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 1, 1, 2, 0],
      [0, 0, 0, 2, 3],
    ]);
  }

  addCommand(type: string): void {
    if (!this.isRunning()) {
      this.commands.update((prev: string[]) => [...prev, type]);
    }
  }

  clear(): void {
    if (!this.isRunning()) {
      this.commands.set([]);
    }
  }

  async runSequence(): Promise<void> {
    if (this.commands().length === 0) return;
    this.isRunning.set(true);

    for (const cmd of this.commands()) {
      let nextPos: Position = { ...this.robotPosition() };
      if (cmd === 'frente') nextPos.y++;
      if (cmd === 'direita') nextPos.x++;

      if (this.isValidMove(nextPos)) {
        this.robotPosition.set(nextPos);
        await new Promise<void>(r => setTimeout(r, 600));

        if (this.isVictory(nextPos)) {
          await this.supabaseService.saveLevelProgress('USER_TEMP', this.id() || '1');
          const result: SweetAlertResult = await this.feedbackService.showSuccess(this.id() || '1');
          
          if (result.isConfirmed) {
            const nextLevel: number = Number(this.id()) + 1;
            this.router.navigate(['/level', nextLevel]);
          } else {
            this.resetLevel();
          }
          this.isRunning.set(false);
          return;
        }
      } else {
        await this.feedbackService.showError();
        this.resetLevel();
        return;
      }
    }
    this.commands.set([]);
    this.isRunning.set(false);
  }

  isValidMove(pos: Position): boolean {
    const grid: number[][] = this.mapGrid();
    return grid[pos.y]?.[pos.x] === 2 || grid[pos.y]?.[pos.x] === 3;
  }

  isVictory(pos: Position): boolean {
    return this.mapGrid()[pos.y]?.[pos.x] === 3;
  }

  resetLevel(): void {
    this.robotPosition.set({ x: 0, y: 0 });
    this.commands.set([]);
    this.isRunning.set(false);
  }
}