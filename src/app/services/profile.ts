import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  public selectedAvatar = signal<string>('');
  public playerName = signal<string>('Explorador');

  setAvatar(avatar: string): void {
    this.selectedAvatar.set(avatar);
  }
}