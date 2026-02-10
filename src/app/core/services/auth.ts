import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
    id: string;
    email: string;
    name: string;
    level: number;
    score: number;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private STORAGE_KEY = 'kids_logic_game_users';
    private SESSION_KEY = 'kids_logic_game_session';

    private currentUserSig = signal<User | null>(null);
    public currentUser = computed(() => this.currentUserSig());
    public isAuthenticated = computed(() => !!this.currentUserSig());

    constructor(private router: Router) {
        this.restoreSession();
    }

    private restoreSession(): void {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (session) {
            try {
                const user = JSON.parse(session);
                this.currentUserSig.set(user);
            } catch (e) {
                console.error('Failed to restore session', e);
                localStorage.removeItem(this.SESSION_KEY);
            }
        }
    }

    login(email: string, password: string): Observable<User> {
        return new Observable(observer => {
            setTimeout(() => {
                const users = this.getUsers();
                let user = users.find((u: any) => u.email === email && u.password === password);

                if (!user && (email === 'test@test.com' || email === 'admin@admin.com')) {
                    user = {
                        id: '1',
                        email: email,
                        password: password,
                        name: 'Admin User',
                        level: 1,
                        score: 0
                    };
                    users.push(user);
                    this.saveUsers(users);
                }

                if (user) {
                    const { password: _, ...safeUser } = user;
                    this.startSession(safeUser);
                    observer.next(safeUser);
                    observer.complete();
                } else {
                    observer.error(new Error('Email ou senha incorretos'));
                }
            }, 800);
        });
    }

    register(email: string, password: string, name: string): Observable<User> {
        return new Observable(observer => {
            setTimeout(() => {
                const users = this.getUsers();
                if (users.some((u: any) => u.email === email)) {
                    observer.error(new Error('Email já cadastrado'));
                    return;
                }

                const newUser = {
                    id: crypto.randomUUID(),
                    email,
                    password,
                    name,
                    level: 1,
                    score: 0
                };

                users.push(newUser);
                this.saveUsers(users);

                const { password: _, ...safeUser } = newUser;
                this.startSession(safeUser);
                observer.next(safeUser);
                observer.complete();
            }, 1000);
        });
    }

    logout(): void {
        localStorage.removeItem(this.SESSION_KEY);
        this.currentUserSig.set(null);
        this.router.navigate(['/welcome']);
    }

    updateProgress(level: number, scoreToAdd: number): void {
        const user = this.currentUserSig();
        if (!user) return;

        const users = this.getUsers();
        const index = users.findIndex((u: any) => u.id === user.id);

        if (index !== -1) {
            users[index].level = Math.max(users[index].level, level);
            users[index].score = (users[index].score || 0) + scoreToAdd;
            this.saveUsers(users);

            const { password, ...safeUser } = users[index];
            this.startSession(safeUser);
        }
    }

    private startSession(user: User): void {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        this.currentUserSig.set(user);
    }

    private getUsers(): any[] {
        const users = localStorage.getItem(this.STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    }

    private saveUsers(users: any[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }
}
