import { Component, signal, computed, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-level',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './level.html',
  styleUrl: './level.scss'
})export class Level implements OnInit {
  id = input<string>();
  commands = signal<string[]>([]);
  robotPosition = signal({ x: 0, y: 0 });
  isRunning = signal(false);
  mapGrid = signal<number[][]>([]);

  ngOnInit(): void {
    this.loadLevelData();
  }

  async loadLevelData(): Promise<void> {
    const mockMap: number[][] = [
      [2, 2, 1, 0, 0],
      [0, 2, 1, 0, 0],
      [0, 2, 2, 2, 0],
      [0, 1, 1, 2, 0],
      [0, 0, 0, 2, 3],
    ];
    this.mapGrid.set(mockMap);
  }

  clear(): void {
    if (!this.isRunning()) this.commands.set([]);
  }

  resetGame(): void {
    this.robotPosition.set({ x: 0, y: 0 });
    this.commands.set([]);
  }

  addCommand(type: string): void {
    if (!this.isRunning()) this.commands.update(prev => [...prev, type]);
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runSequence() {
    if (this.commands().length === 0) return;
    
    this.isRunning.set(true);
    const sequence = [...this.commands()]; // Cópia da sequência atual

    for (const cmd of sequence) {
      const current = this.robotPosition();
      let nextPos = { ...current };

      if (cmd === 'frente') nextPos.y++;
      if (cmd === 'direita') nextPos.x++;

      if (this.isValidMove(nextPos)) {
        this.robotPosition.set(nextPos);
        await this.delay(600);
        
        if (this.checkVictory(nextPos)) {
          alert('PARABÉNS! Você chegou ao destino! ⭐');
          this.commands.set([]); // Limpa a mochila após vencer
          this.isRunning.set(false);
          return;
        }
      } else {
        alert('Caminho bloqueado! O robô parou.');
        // Se bater, ele para onde está e não executa o resto da lista
        this.commands.set([]); 
        this.isRunning.set(false);
        return;
      }
    }

    // Após executar todos os comandos com sucesso, limpa a mochila
    // para que os próximos comandos comecem de onde ele parou
    this.commands.set([]);
    this.isRunning.set(false);
  }

  isValidMove(pos: {x: number, y: number}): boolean {
    const grid = this.mapGrid();
    if (pos.y >= 0 && pos.y < grid.length && pos.x >= 0 && pos.x < grid[0].length) {
      const cell = grid[pos.y][pos.x];
      return cell === 2 || cell === 3;
    }
    return false;
  }

  checkVictory(pos: {x: number, y: number}): boolean {
    return this.mapGrid()[pos.y][pos.x] === 3;
  }
}