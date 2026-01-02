import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { adultGuard } from './adult-guard';

describe('adultGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => adultGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
