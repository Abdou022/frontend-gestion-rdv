// src/app/services/auth.service.ts
import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private isBrowser: boolean;

  utilisateurConnecte = signal<User | null>(this.chargerUtilisateur());

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, motDePasse })
      .pipe(
        tap((response) => {
          if (response.success && this.isBrowser) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.utilisateurConnecte.set(response.user);
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.utilisateurConnecte.set(null);
    this.router.navigate(['/login']);
  }

  estConnecte(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('token');
  }

  private chargerUtilisateur(): User | null {
    // Guard SSR : localStorage n'existe pas côté serveur
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  getRole(): string {
    return this.utilisateurConnecte()?.role || '';
  }
}
