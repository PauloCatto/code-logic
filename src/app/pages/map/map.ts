import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoadingService } from '../../core/services/loading';
import { Level } from '../../models/level.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit {
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  public levels: Level[] = [
    { id: 1, unlocked: true, top: '75%', left: '15%', status: 'unlocked' },
    { id: 2, unlocked: false, top: '55%', left: '25%', status: 'locked' },
    { id: 3, unlocked: false, top: '40%', left: '35%', status: 'locked' },
    { id: 4, unlocked: false, top: '55%', left: '45%', status: 'locked' },
    { id: 5, unlocked: false, top: '70%', left: '55%', status: 'locked' },
    { id: 6, unlocked: false, top: '45%', left: '65%', status: 'locked' },
    { id: 7, unlocked: false, top: '30%', left: '75%', status: 'locked' },
    { id: 8, unlocked: false, top: '45%', left: '85%', status: 'locked' },
  ];

  ngOnInit(): void {
    this.loadingService.stop();
    this.updateProgress();
  }

  updateProgress(): void {
    const savedLevel = localStorage.getItem('unlockedLevel');
    const currentUnlockedLevel = savedLevel ? Number(savedLevel) : 1;

    this.levels = this.levels.map((level) => {
      let currentStatus: 'locked' | 'unlocked' | 'completed' = 'locked';

      if (level.id < currentUnlockedLevel) {
        currentStatus = 'completed';
      } else if (level.id === currentUnlockedLevel) {
        currentStatus = 'unlocked';
      } else {
        currentStatus = 'locked';
      }

      return {
        ...level,
        unlocked: level.id <= currentUnlockedLevel,
        status: currentStatus,
      };
    });
  }

  public navigateToLevel(levelId: number, isAvailable: boolean): void {
    if (!isAvailable) return;
    this.loadingService.start();
    this.router.navigate(['/level', levelId]);
  }
}
