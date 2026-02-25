import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoadingService } from '../../core/services/loading';
import { ProfileService } from '../../core/services/profile';
import { Level } from '../../models/level.model';
import { GameDialog } from '../../components/game-dialog/game-dialog';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule, GameDialog],
  templateUrl: './map.html',
  styleUrls: ['./map.scss'],
})
export class Map implements OnInit {
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private profileService = inject(ProfileService);

  public levels: Level[] = [];

  showDialog = signal(false);
  confirm = signal(false);
  showCancel = signal(false);

  dialogData = signal({
    title: 'Reiniciar Progresso',
    message: 'Tem certeza que deseja apagar todo o progresso? Isso não poderá ser desfeito!',
    buttonText: 'Sim',
  });

  async ngOnInit(): Promise<void> {
    this.loadingService.stop();
    await this.buildLevels();
  }

  private async buildLevels(): Promise<void> {
    let unlockedLevel = 1;

    const profile = this.profileService.levels();
    const unlockedFromProfile = profile.find(
      (l) => l.status === 'unlocked' || l.status === 'completed'
    );

    if (unlockedFromProfile) {
      const completed = profile.filter((l) => l.status === 'completed');
      unlockedLevel = completed.length > 0 ? Math.max(...completed.map((l) => l.id)) + 1 : 1;
    }

    const saved = localStorage.getItem('unlockedLevel');
    if (saved) {
      unlockedLevel = Math.max(unlockedLevel, Number(saved));
    }

    this.resetLevels(unlockedLevel);
  }

  private resetLevels(currentUnlockedLevel: number): void {
    const positions = [
      { top: '75%', left: '15%' },
      { top: '55%', left: '25%' },
      { top: '40%', left: '35%' },
      { top: '55%', left: '45%' },
      { top: '70%', left: '55%' },
      { top: '45%', left: '65%' },
      { top: '30%', left: '75%' },
      { top: '45%', left: '85%' },
    ];

    this.levels = positions.map((pos, index) => {
      const id = index + 1;
      let status: 'locked' | 'unlocked' | 'completed' = 'locked';

      if (id < currentUnlockedLevel) status = 'completed';
      else if (id === currentUnlockedLevel) status = 'unlocked';

      return { id, unlocked: id <= currentUnlockedLevel, status, ...pos };
    });

    if (currentUnlockedLevel > 8) {
      this.dialogData.set({
        title: 'Parabéns! 🎉',
        message: 'Você conseguiu. Missão cumprida.',
        buttonText: 'Voltar ao início',
      });

      this.confirm.set(true);
      this.showCancel.set(false);
      this.showDialog.set(true);
    }
  }

  navigateToLevel(levelId: number, isAvailable: boolean): void {
    if (!isAvailable) return;
    this.loadingService.start();
    this.router.navigate(['/level', levelId]);
  }

  confirmResetProgress(): void {
    this.confirm.set(true);
    this.showCancel.set(true);
    this.showDialog.set(true);
  }

  async onDialogClose(confirmed: boolean): Promise<void> {
    this.showDialog.set(false);
    this.confirm.set(false);
    this.showCancel.set(false);

    if (!confirmed) return;

    this.loadingService.start();
    await this.profileService.resetProgress();

    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}
