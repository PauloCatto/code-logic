import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../core/services/loading';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.html',
})
export class Welcome {
  private router = inject(Router);
  private loading = inject(LoadingService);

  enterKidsMode(): void {
    this.loading.start();

    setTimeout(() => {
      this.router.navigate(['/map']);
    }, 900);
  }
}
