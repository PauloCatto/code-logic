import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-map',
  imports: [CommonModule, RouterModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  fases: { id: number; aberta: boolean; top: string; left: string }[] = [
    { id: 1, aberta: true, top: '70%', left: '15%' },
    { id: 2, aberta: false, top: '55%', left: '25%' },
    { id: 3, aberta: false, top: '40%', left: '35%' },
    { id: 4, aberta: false, top: '55%', left: '45%' },
    { id: 5, aberta: false, top: '70%', left: '55%' },
    { id: 6, aberta: false, top: '40%', left: '65%' },
    { id: 7, aberta: false, top: '30%', left: '75%' },
    { id: 8, aberta: false, top: '45%', left: '85%' },
  ];
}
