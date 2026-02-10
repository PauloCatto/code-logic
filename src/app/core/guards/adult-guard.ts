import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adultGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService); // Use AuthService

  if (auth.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/adult-welcome']); // Redirect to welcome first
    return false;
  }
};
