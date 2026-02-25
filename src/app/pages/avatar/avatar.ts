import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile';
import { LoadingService } from '../../core/services/loading';
import { AvatarOption } from '../../models/avatar-state.model';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.html',
})
export class Avatar implements OnInit {
  private router = inject(Router);
  private profile = inject(ProfileService);
  private loading = inject(LoadingService);

  avatares: AvatarOption[] = [
    { id: 1, icon: '🤖' },
    { id: 2, icon: '🐱‍🚀' },
    { id: 3, icon: '🦖' },
    { id: 4, icon: '🦄' },
    { id: 5, icon: '🦊' },
    { id: 6, icon: '🐒' },
  ];

  selectedId = signal<number | null>(null);
  playerName = signal<string>('');

  selectedAvatar = computed(() => this.avatares.find((a) => a.id === this.selectedId()) || null);

  ngOnInit(): void {
    this.loading.stop();
  }

  select(option: AvatarOption): void {
    this.selectedId.set(option.id);
  }

  updateName(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.playerName.set(value);
  }

  async confirmSelection(): Promise<void> {
    const avatar = this.selectedAvatar();
    const name = this.playerName().trim();

    if (!avatar || !name) return;

    await this.profile.setProfile({
      name,
      avatar: avatar.icon,
    });

    this.loading.start();

    setTimeout(() => {
      this.router.navigate(['/map']);
    }, 600);
  }
}
