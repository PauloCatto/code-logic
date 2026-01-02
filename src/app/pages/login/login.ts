import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../core/services/profile';
import { LoadingService } from '../../core/services/loading';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private profile = inject(ProfileService);
  private loading = inject(LoadingService);

  email: string = '';
  playerName = signal<string | null>(null);
  cameFromAvatar: boolean = false;

  ngOnInit(): void {
    this.loading.stop();

    const profile = this.profile.getProfile();
    this.playerName.set(profile?.name ?? null);

    this.cameFromAvatar = this.route.snapshot.queryParamMap.get('from') === 'avatar';
  }

  loginWithGoogle(): void {
    this.loading.start();

    setTimeout(() => {
      this.finishLogin();
    }, 800);
  }

  loginWithEmail(): void {
    if (!this.email) return;

    this.loading.start();

    setTimeout(() => {
      this.finishLogin();
    }, 800);
  }

  loginAsGuest(): void {
    this.router.navigate(['/map']);
  }

  private finishLogin(): void {
    this.loading.stop();
    this.router.navigate(['/map']);
  }
}
