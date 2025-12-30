import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-game-dialog',
  imports: [],
  templateUrl: './game-dialog.html',
  styleUrl: './game-dialog.scss',
})
export class GameDialog {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() buttonText: string = 'OK';
  @Output() close = new EventEmitter<void>();

  onButtonClick(): void {
    this.close.emit();
  }
}
