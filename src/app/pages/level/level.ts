import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as Blockly from 'blockly';

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
  private workspace?: Blockly.WorkspaceSvg;

  currentLevelId = signal(1);
  playerProfile = this.profileService.getProfile();
  robotPosition = signal<Position>({ x: 0, y: 0 });
  mapGrid = signal<number[][]>([]);
  isRunning = signal(false);
  levelCompleted = signal(false);

  private lastDir: 'baixo' | 'direita' | 'esquerda' = 'direita';
  private jumpAllowedLevels: number[] = [2, 4, 5, 6, 7, 8];
  public isSmallScreen = signal(window.innerWidth < 600);
  private executionIndex: number = 0;

  private checkScreenSize(): void {
    this.isSmallScreen.set(window.innerWidth < 600);
  }

  ngOnInit(): void {
    this.loading.stop();
    this.checkScreenSize();

    this.routeSub = this.route.params.subscribe((params) => {
      const id = Number(params['id'] || 1);
      this.currentLevelId.set(id);
      this.loadLevelData(id);
      queueMicrotask(() => this.initBlockly());
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.workspace?.dispose();
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.checkScreenSize();
    if (this.workspace) {
      Blockly.svgResize(this.workspace);
    }
  };

  initBlockly(): void {
    if (this.workspace) this.workspace.dispose();

    this.registerBlocks();

    const isMobile = window.innerWidth < 768;

    this.workspace = Blockly.inject('blocklyDiv', {
      toolbox: {
        kind: 'flyoutToolbox',
        contents: [
          { kind: 'block', type: 'baixo' },
          { kind: 'block', type: 'direita' },
          { kind: 'block', type: 'esquerda' },
          { kind: 'block', type: 'pular' },
        ],
      },
      trashcan: true,
      scrollbars: true,
      move: { drag: true, wheel: true },
      horizontalLayout: false,
      toolboxPosition: 'start',
      zoom: {
        controls: false,
        wheel: true,
        startScale: isMobile ? 0.75 : 1,
      },
      renderer: 'thrasos',
    });

    setTimeout(() => {
      Blockly.svgResize(this.workspace!);
      const injectionDiv = this.workspace!.getInjectionDiv() as HTMLElement;

      injectionDiv.scrollTop = 0;
      injectionDiv.scrollLeft = 0;

      const hScrollbar = injectionDiv.querySelector('.blocklyScrollbarHorizontal');
      if (hScrollbar) (hScrollbar as HTMLElement).style.display = 'none';

      this.workspace!.scroll(0, 0);

      if (isMobile) {
        const workspaceDiv = this.workspace!.getInjectionDiv() as HTMLElement;
        workspaceDiv.style.paddingBottom = '60px';
      }
    }, 0);

    window.addEventListener('resize', this.handleResize);
  }

  registerBlocks(): void {
    const create = (type: string, label: string, color: number) => {
      Blockly.Blocks[type] = {
        init() {
          this.appendDummyInput().appendField(label);
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setColour(color);
        },
      };
    };

    create('baixo', '⬇ descer', 180);
    create('direita', '➡ direita', 200);
    create('esquerda', '⬅ esquerda', 160);
    create('pular', '⤴ pular', 260);
  }

  runFromBlockly(): void {
    if (!this.workspace || this.isRunning()) return;

    const commands: string[] = [];

    const topBlocks = this.workspace.getTopBlocks(true);
    if (!topBlocks.length) return;

    let block: Blockly.Block | null = topBlocks[0];

    while (block) {
      commands.push(block.type);
      block = block.getNextBlock();
    }

    this.runSequence(commands);
  }

  async runSequence(commands: string[]): Promise<void> {
    if (this.executionIndex >= commands.length) return;

    this.isRunning.set(true);

    let { x, y } = this.robotPosition();

    for (let i = this.executionIndex; i < commands.length; i++) {
      const cmd = commands[i];

      if (cmd === 'pular') {
        if (!this.jumpAllowedLevels.includes(this.currentLevelId())) {
          await this.feedback.showError();
          this.resetGame();
          return;
        }

        let nx = x;
        let ny = y;

        for (let step = 0; step < 2; step++) {
          if (this.lastDir === 'baixo') ny++;
          else if (this.lastDir === 'direita') nx++;
          else if (this.lastDir === 'esquerda') nx--;
        }

        if (!this.isWalkable(nx, ny)) {
          await this.feedback.showError();
          this.resetGame();
          return;
        }

        x = nx;
        y = ny;
        this.robotPosition.set({ x, y });
        await this.delay(400);
      } else {
        let nx = x;
        let ny = y;

        if (cmd === 'baixo') {
          ny++;
          this.lastDir = 'baixo';
        } else if (cmd === 'direita') {
          nx++;
          this.lastDir = 'direita';
        } else if (cmd === 'esquerda') {
          nx--;
          this.lastDir = 'esquerda';
        }

        if (!this.isWalkable(nx, ny)) {
          await this.feedback.showError();
          this.resetGame();
          return;
        }

        x = nx;
        y = ny;
        this.robotPosition.set({ x, y });
        await this.delay(600);
      }

      this.executionIndex++;

      if (this.mapGrid()[y][x] === 3) {
        this.levelCompleted.set(true);
        break;
      }
    }

    this.isRunning.set(false);
  }

  isWalkable(x: number, y: number): boolean {
    const g = this.mapGrid();
    return g[y]?.[x] === 2 || g[y]?.[x] === 3;
  }

  resetGame(): void {
    this.robotPosition.set({ x: 0, y: 0 });
    this.lastDir = 'direita';
    this.executionIndex = 0;
    this.isRunning.set(false);
    this.levelCompleted.set(false);
  }

  resetState(): void {
    this.resetGame();
    this.workspace?.clear();
  }

  delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  finish(): void {
    const id = this.currentLevelId();
    localStorage.setItem('unlockedLevel', String(id + 1));

    if (id === 1) {
      this.router.navigate(['/avatar']);
      return;
    }

    this.router.navigate(['/map']);
  }

  loadLevelData(id: number): void {
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
      5: [
        [2, 0, 2, 2, 2],
        [2, 0, 0, 0, 2],
        [2, 2, 2, 0, 2],
        [0, 0, 2, 0, 2],
        [2, 2, 2, 2, 3],
      ],
      6: [
        [2, 2, 0, 2, 2],
        [0, 2, 0, 0, 2],
        [2, 2, 2, 0, 2],
        [2, 0, 0, 0, 2],
        [2, 2, 2, 2, 3],
      ],
      7: [
        [2, 2, 0, 2, 2],
        [0, 2, 2, 2, 0],
        [2, 0, 2, 0, 2],
        [2, 2, 2, 2, 2],
        [0, 0, 2, 0, 3],
      ],
      8: [
        [2, 2, 0, 2, 2],
        [2, 0, 2, 0, 2],
        [2, 2, 2, 2, 0],
        [0, 2, 0, 2, 2],
        [2, 0, 2, 0, 3],
      ],
    };

    this.mapGrid.set(levels[id] || levels[1]);
  }
}
