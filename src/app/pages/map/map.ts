import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { LoadingService } from '../../core/services/loading';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit {
  private router = inject(Router);
  private loading = inject(LoadingService);

  fases = [
    { id: 1, aberta: true, top: '70%', left: '15%' },
    { id: 2, aberta: false, top: '55%', left: '25%' },
    { id: 3, aberta: false, top: '40%', left: '35%' },
    { id: 4, aberta: false, top: '55%', left: '45%' },
    { id: 5, aberta: false, top: '70%', left: '55%' },
    { id: 6, aberta: false, top: '40%', left: '65%' },
    { id: 7, aberta: false, top: '30%', left: '75%' },
    { id: 8, aberta: false, top: '45%', left: '85%' },
  ];

  ngOnInit(): void {
    this.loading.stop();
  }

  goToLevel(faseId: number, aberta: boolean): void {
    if (!aberta) return;

    this.loading.start();

    setTimeout(() => {
      this.router.navigate(['/level', faseId]);
    }, 900);
  }
}
