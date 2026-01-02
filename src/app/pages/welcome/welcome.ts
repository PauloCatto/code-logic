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
  Olá! 🐾🤖

  Aqui você não controla o robô diretamente.
  Você monta uma sequência de comandos e depois executa tudo de uma vez.

  📦 Comandos disponíveis:
  ⬇️ Baixo  
  ➡️ Direita  
  ⬅️ Esquerda (liberado a partir do Level 3)  
  ⤴️ Pulo Duplo (em desafios específicos)

  ▶️ Como funciona:
  • Adicione os comandos na ordem desejada  
  • Execute a sequência quando estiver pronto  
  • O robô continuará do ponto onde parou, mesmo se você voltar ou ajustar os comandos  

  ⭐ Objetivo:
  Leve o robô até a estrela de cada fase.
  Observe o mapa, evite obstáculos e pense alguns passos à frente.

  Aqui, planejar bem é tão importante quanto executar.
  `,
    buttonText: 'Vamos lá!',
  });

  enterKidsMode(): void {
    this.showDialog.set(true);
  }

  enterAdultMode(): void {
    this.router.navigate(['/login']);
  }

  onDialogClose(): void {
    this.showDialog.set(false);
    this.loading.start();
    setTimeout(() => {
      this.router.navigate(['/map']);
    }, 500);
  }
}
