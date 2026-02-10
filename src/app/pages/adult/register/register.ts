import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.html',
    styleUrl: './register.scss',
})
export class Register {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    isLoading = signal(false);
    errorMessage = signal('');

    onSubmit(): void {
        if (this.form.invalid) return;

        this.isLoading.set(true);
        this.errorMessage.set('');

        const { name, email, password } = this.form.getRawValue();

        this.auth.register(email!, password!, name!).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/adult']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err.message || 'Erro ao criar conta');
            }
        });
    }

    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }
}
