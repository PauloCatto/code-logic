import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-onboarding',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './onboarding.html',
    styleUrl: './onboarding.scss',
})
export class Onboarding {
    private router = inject(Router);

    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }

    navigateToRegister(): void {
        this.router.navigate(['/register']);
    }
}
