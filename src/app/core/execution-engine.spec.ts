import { TestBed } from '@angular/core/testing';

import { ExecutionEngine } from './execution-engine';

describe('ExecutionEngine', () => {
  let service: ExecutionEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExecutionEngine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
