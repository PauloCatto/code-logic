import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as Blockly from 'blockly';

import { FeedbackService } from '../../core/services/feedback';
import { LoadingService } from '../../core/services/loading';
import { ProfileService } from '../../core/services/profile';
import { SupabaseService } from '../../core/services/supabase';
import { Position } from '../../models/level.model';

@Component({
  selector: 'app-level',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './level.html',
  styleUrl: './level.scss',
})
export class Level implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private feedback = inject(FeedbackService);
  private loading = inject(LoadingService);
  public profileService = inject(ProfileService);
  private supabase = inject(SupabaseService);

  private routeSub?: Subscription;
  private workspace?: Blockly.WorkspaceSvg;

  currentLevelId = signal(1);
  playerProfile = this.profileService.getProfile();
  robotPosition = signal<Position>({ x: 0, y: 0 });
  mapGrid = signal<number[][]>([]);
  isRunning = signal(false);
  levelCompleted = signal(false);

  private lastDir: 'baixo' | 'direita' | 'esquerda' | 'cima' = 'direita';
  private jumpAllowedLevels: number[] = [2, 4, 5, 6, 7, 8, 9, 10];
  public isSmallScreen = signal(window.innerWidth < 600);
  private executionIndex: number = 0;
  private lastCommands: string[] = [];

  private checkScreenSize(): void {
    this.isSmallScreen.set(window.innerWidth < 600);
  }

  ngOnInit(): void {
    this.loading.stop();
    this.checkScreenSize();

    this.routeSub = this.route.params.subscribe((params) => {
      const id = Number(params['id'] || 1);
      this.currentLevelId.set(id);
      this.levelCompleted.set(false);
      this.resetGame();
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

    const hasLoops = this.currentLevelId() >= 3;

    const toolboxContents: any[] = [
      { kind: 'block', type: 'baixo' },
      { kind: 'block', type: 'direita' },
      { kind: 'block', type: 'esquerda' },
      { kind: 'block', type: 'cima' },
      { kind: 'block', type: 'pular' },
    ];

    if (hasLoops) {
      toolboxContents.push({ kind: 'block', type: 'controls_repeat_ext', inputs: { 'TIMES': { shadow: { type: 'math_number', fields: { 'NUM': 3 } } } } });
    }

    this.workspace = Blockly.inject('blocklyDiv', {
      toolbox: {
        kind: 'flyoutToolbox',
        contents: toolboxContents,
      },
      trashcan: false,
      scrollbars: false,
      move: { drag: true, wheel: true },
      horizontalLayout: false,
      toolboxPosition: 'start',
      zoom: {
        controls: false,
        wheel: true,
        startScale: isMobile ? 0.75 : 0.9,
      },
      renderer: 'geras',
      theme: {
        'name': 'kids-theme',
        'base': Blockly.Themes.Classic,
        'componentStyles': {
          'workspaceBackgroundColour': '#1e293b',
          'toolboxBackgroundColour': '#0f172a',
          'flyoutBackgroundColour': '#0f172a',
          'flyoutOpacity': 0.8
        }
      }
    });

    setTimeout(() => {
      Blockly.svgResize(this.workspace!);
      this.workspace!.scroll(0, 0);
    }, 100);

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

    create('baixo', '⬇ descer', 210);
    create('direita', '➡ direita', 230);
    create('esquerda', '⬅ esquerda', 230);
    create('cima', '⬆ subir', 210);
    create('pular', '⤴ pular', 290);
  }

  runFromBlockly(): void {
    if (!this.workspace || this.isRunning()) return;

    const topBlocks = this.workspace.getTopBlocks(true);
    if (!topBlocks.length) return;

    const startBlock = topBlocks[0];
    const commands = this.parseBlocks(startBlock);
    this.lastCommands = commands;

    this.resetGame();
    this.runSequence(commands);
  }

  parseBlocks(block: Blockly.Block | null): string[] {
    const commands: string[] = [];

    while (block) {
      if (block.type === 'controls_repeat_ext') {
        const timesInput = block.getInput('TIMES');
        let times = 1;

        const targetBlock = timesInput?.connection?.targetBlock();
        if (targetBlock && targetBlock.type === 'math_number') {
          times = Number(targetBlock.getFieldValue('NUM'));
        }

        const branchBlock = block.getInputTargetBlock('DO');
        const loopCommands = this.parseBlocks(branchBlock);

        for (let i = 0; i < times; i++) {
          commands.push(...loopCommands);
        }
      } else {
        commands.push(block.type);
      }
      block = block.getNextBlock();
    }
    return commands;
  }

  async runSequence(commands: string[]): Promise<void> {
    if (this.executionIndex >= commands.length) {
      this.executionIndex = 0;
    }

    this.isRunning.set(true);
    this.levelCompleted.set(false);

    let { x, y } = this.robotPosition();

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];

      if (cmd === 'pular') {
        if (!this.jumpAllowedLevels.includes(this.currentLevelId())) {
          await this.feedback.showError();
          this.resetGame();
          await this.saveLog(false);
          return;
        }

        let nx = x;
        let ny = y;

        for (let step = 0; step < 2; step++) {
          if (this.lastDir === 'baixo') ny++;
          else if (this.lastDir === 'cima') ny--;
          else if (this.lastDir === 'direita') nx++;
          else if (this.lastDir === 'esquerda') nx--;
        }

        if (!this.isWalkable(nx, ny)) {
          await this.feedback.showError();
          this.resetGame();
          await this.saveLog(false);
          return;
        }
        x = nx; y = ny;
        this.robotPosition.set({ x, y });
        await this.delay(400);

      } else {
        let nx = x;
        let ny = y;

        if (cmd === 'baixo') { ny++; this.lastDir = 'baixo'; }
        else if (cmd === 'cima') { ny--; this.lastDir = 'cima'; }
        else if (cmd === 'direita') { nx++; this.lastDir = 'direita'; }
        else if (cmd === 'esquerda') { nx--; this.lastDir = 'esquerda'; }

        if (!this.isWalkable(nx, ny)) {
          await this.feedback.showError();
          this.resetGame();
          await this.saveLog(false);
          return;
        }
        x = nx; y = ny;
        this.robotPosition.set({ x, y });
        await this.delay(500);
      }

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

    this.levelCompleted.set(false);
    this.profileService.completeLevel(id);
    this.saveLog(true);

    if (id === 1) {
      this.router.navigate(['/avatar']);
      return;
    }

    if (id >= 10) {
      this.router.navigate(['/map']);
      return;
    }

    this.router.navigate(['/level', id + 1]);
  }

  private async saveLog(success: boolean): Promise<void> {
    const userId = this.profileService.childUserId();
    if (!userId) return;

    await this.supabase.saveGameLog({
      child_id: userId,
      level_id: this.currentLevelId(),
      success,
      commands_used: this.lastCommands,
    });
  }

  async loadLevelData(id: number): Promise<void> {
    const remote = await this.supabase.getLevelDefinition(id);
    if (remote) {
      this.mapGrid.set(remote.grid);
      if (remote.jump_allowed && !this.jumpAllowedLevels.includes(id)) {
        this.jumpAllowedLevels = [...this.jumpAllowedLevels, id];
      }
      return;
    }

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
        [2, 2, 2, 1, 2],
        [0, 0, 2, 0, 2],
        [2, 2, 2, 2, 3],
      ],
      6: [
        [2, 2, 0, 2, 2],
        [1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2],
        [2, 1, 1, 1, 2],
        [2, 2, 2, 2, 3],
      ],
      7: [
        [2, 2, 1, 2, 2],
        [1, 2, 1, 2, 1],
        [1, 2, 2, 2, 1],
        [1, 2, 1, 2, 1],
        [1, 2, 1, 2, 3],
      ],
      8: [
        [2, 2, 2, 2, 2],
        [2, 1, 1, 1, 2],
        [2, 1, 1, 1, 2],
        [2, 1, 1, 1, 2],
        [2, 2, 2, 2, 3],
      ],
      9: [
        [2, 2, 1, 2, 2],
        [1, 2, 1, 2, 1],
        [1, 2, 2, 2, 1],
        [1, 2, 1, 2, 1],
        [1, 2, 2, 2, 3],
      ],
      10: [
        [2, 2, 2, 2, 2],
        [2, 1, 1, 1, 2],
        [2, 1, 3, 1, 2],
        [2, 1, 2, 2, 2],
        [2, 2, 2, 1, 1],
      ]
    };

    const grid = levels[id] || levels[1];
    this.mapGrid.set(grid);
  }
}
