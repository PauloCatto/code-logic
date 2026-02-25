import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile';
import { AuthService } from '../../core/services/auth';
import { LoadingService } from '../../core/services/loading';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private router = inject(Router);
  private profile = inject(ProfileService);
  private auth = inject(AuthService);
  private loadingService = inject(LoadingService);
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadingService.stop();
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  loginWithGoogle(): void {
    this.loading.set(true);
    this.loadingService.start();

    setTimeout(() => {
      this.finishLogin();
    }, 800);
  }

  loginWithEmail(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.loadingService.start();

    setTimeout(() => {
      this.finishLogin();
    }, 800);
  }

  private finishLogin(): void {
    this.errorMessage.set('');

    const { email, password } = this.loginForm.getRawValue();

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadingService.stop();
        this.router.navigate(['/adult']);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadingService.stop();
        this.errorMessage.set(err.message || 'Erro ao entrar');
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
