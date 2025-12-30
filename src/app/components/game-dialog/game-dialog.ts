import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-dialog.html',
  styleUrls: ['./game-dialog.scss'],
})
export class GameDialog {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() buttonText: string = 'OK';
  @Input() confirm: boolean = false;
  @Input() showCancel: boolean = false;
  @Output() close = new EventEmitter<boolean>();

  onButtonClick(): void {
    this.close.emit(true);
  }

  onCancelClick(): void {
    this.close.emit(false);
  }
}
