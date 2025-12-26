import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  readonly isLoading = signal<boolean>(false);

  start(): void {
    this.isLoading.set(true);
  }

  stop(): void {
    this.isLoading.set(false);
  }

  async withDelay(ms = 1200): Promise<void> {
    this.start();
    await new Promise(resolve => setTimeout(resolve, ms));
    this.stop();
  }
}
