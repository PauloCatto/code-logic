import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necessário para o [(ngModel)]
import { ProfileService } from '../../services/profile';

interface AvatarOption {
  id: number;
  icon: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './avatar.html'
})
export class Avatar {
  private profileService: ProfileService = inject(ProfileService);
  private router: Router = inject(Router);

  // Lista de Avatares
  public avatares: AvatarOption[] = [
    { id: 1, icon: '🤖', label: 'Robô-X', color: 'bg-blue-500' },
    { id: 2, icon: '🐱‍🚀', label: 'Gato-Astro', color: 'bg-purple-500' },
    { id: 3, icon: '🦖', label: 'Dino-Bot', color: 'bg-emerald-500' },
    { id: 4, icon: '🦄', label: 'Uni-Power', color: 'bg-pink-500' },
    { id: 5, icon: '🦊', label: 'Raposa-Z', color: 'bg-orange-500' },
    { id: 6, icon: '🐒', label: 'Kong-Code', color: 'bg-amber-500' }
  ];

  // Signals para gerenciar o estado local antes de salvar no Service
  public selectedId: WritableSignal<number | null> = signal<number | null>(null);
  public playerName: WritableSignal<string> = signal<string>('');

  /**
   * Seleciona visualmente o avatar no grid
   */
  public select(option: AvatarOption): void {
    this.selectedId.set(option.id);
  }

  /**
   * Salva os dados no ProfileService e navega para o mapa
   */
  public confirmSelection(): void {
    const selected = this.avatares.find(a => a.id === this.selectedId());
    
    if (selected) {
      // Usamos o método setProfile que criamos para salvar tudo de uma vez
      const name = this.playerName().trim() || 'Explorador';
      
      // Chamada ao Service (Certifique-se que o método setProfile existe lá)
      this.profileService.setAvatar(selected.icon);
      
      // Se o seu service tiver o sinal playerName, atualizamos ele aqui também
      if (this.profileService.playerName) {
        this.profileService.playerName.set(name);
      }

      this.router.navigate(['/map']);
    }
  }
}