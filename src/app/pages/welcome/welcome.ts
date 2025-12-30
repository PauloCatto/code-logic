import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../core/services/loading';
import { GameDialog } from '../../components/game-dialog/game-dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, GameDialog],
  templateUrl: './welcome.html',
})
export class Welcome {
  private router = inject(Router);
  private loading = inject(LoadingService);

  showDialog = signal(false);

  dialogData = signal({
    title: 'Como Jogar',
    message: `
    Olá! 🐾
    Use os botões para controlar o seu robô:
    
    ⬇️ Baixo  
    ➡️ Direita  
    ⬅️ Esquerda (disponível a partir do Level 3)  
    ⤴️ Pulo Duplo (disponível em alguns desafios)
    
    O objetivo é chegar na estrela ⭐ de cada fase!  
    Observe os obstáculos, planeje seus movimentos e divirta-se explorando cada desafio!
  `,
    buttonText: 'Vamos lá!',
  });

  enterKidsMode(): void {
    this.showDialog.set(true);
  }

  onDialogClose(): void {
    this.showDialog.set(false);
    this.loading.start();
    setTimeout(() => {
      this.router.navigate(['/map']);
    }, 500);
  }
}
