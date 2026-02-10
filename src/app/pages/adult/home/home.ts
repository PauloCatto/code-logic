import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ADULT_CHALLENGES, Challenge } from '../../../core/data/adult-challenges.data';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { GameDialog } from '../../../components/game-dialog/game-dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GameDialog],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private auth = inject(AuthService);
  private router = inject(Router);

  challenges = signal<Challenge[]>(ADULT_CHALLENGES);
  currentChallengeIndex = signal<number>(0);

  currentChallenge = computed(() => this.challenges()[this.currentChallengeIndex()]);

  user = this.auth.currentUser;

  selectedOption = signal<number | null>(null);
  isAnswered = signal<boolean>(false);
  isCorrect = signal<boolean>(false);
  score = computed(() => this.user()?.score || 0);

  showDialog = signal<boolean>(false);

  selectOption(index: number): void {
    if (this.isAnswered()) return;
    this.selectedOption.set(index);
  }

  submitAnswer(): void {
    if (this.selectedOption() === null || this.isAnswered()) return;

    const correct = this.currentChallenge().correctAnswer === this.selectedOption();
    this.isCorrect.set(correct);
    this.isAnswered.set(true);

    if (correct) {
      const nextLevel = this.currentChallenge().id + 1;
      this.auth.updateProgress(nextLevel, 10);
    }
  }

  nextChallenge(): void {
    if (this.currentChallengeIndex() < this.challenges().length - 1) {
      this.currentChallengeIndex.update(i => i + 1);
      this.resetState();
    } else {
      this.showDialog.set(true);
    }
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.router.navigate(['/welcome']);
  }

  resetState(): void {
    this.selectedOption.set(null);
    this.isAnswered.set(false);
    this.isCorrect.set(false);
  }

  getOptionClass(index: number): string {
    if (!this.isAnswered()) {
      return this.selectedOption() === index ? 'selected' : '';
    }

    if (index === this.currentChallenge().correctAnswer) {
      return 'correct';
    }

    if (index === this.selectedOption() && !this.isCorrect()) {
      return 'incorrect';
    }

    return '';
  }
}
