import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile';

export const adultGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const profile = inject(ProfileService);

  if (profile.isAdult()) {
    return true;
  } else {
    router.navigate(['/welcome']);
    return false;
  }
};
