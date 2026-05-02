// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">🏥</div>
          <h1>MédiCare</h1>
          <p>Gestion de rendez-vous médicaux</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="votre@email.com"
              [class.error]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-msg">Email invalide</span>
            }
          </div>

          <div class="form-group">
            <label for="motDePasse">Mot de passe</label>
            <div class="password-wrapper">
              <input
                id="motDePasse"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="motDePasse"
                placeholder="••••••••"
                [class.error]="isFieldInvalid('motDePasse')"
              />
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (isFieldInvalid('motDePasse')) {
              <span class="error-msg">Minimum 6 caractères</span>
            }
          </div>

          @if (erreurConnexion) {
            <div class="alert-error">
              ❌ {{ erreurConnexion }}
            </div>
          }

          <button
            type="submit"
            class="btn-login"
            [disabled]="loginForm.invalid || chargement"
          >
            @if (chargement) {
              <span class="spinner"></span> Connexion en cours...
            } @else {
              🔐 Se connecter
            }
          </button>
        </form>

        <div class="login-demo">
          <p>Comptes de démonstration :</p>
          <div class="demo-accounts">
            <button class="demo-btn" (click)="remplirDemo('medecin@clinique.tn', 'Medecin123!')">
              👨‍⚕️ Médecin
            </button>
            <button class="demo-btn" (click)="remplirDemo('secretaire@clinique.tn', 'Secretaire123!')">
              👩‍💼 Secrétaire
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a9f7a 100%);
      padding: 1rem;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;

      .login-logo { font-size: 3rem; margin-bottom: 0.5rem; }
      h1 { font-size: 1.8rem; color: #1e3a5f; margin: 0; font-weight: 700; }
      p { color: #6c757d; font-size: 0.9rem; margin: 0.3rem 0 0; }
    }

    .form-group {
      margin-bottom: 1.2rem;

      label { display: block; font-weight: 600; color: #374151; margin-bottom: 0.4rem; font-size: 0.9rem; }

      input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        font-size: 1rem;
        transition: border-color 0.2s;
        box-sizing: border-box;

        &:focus { outline: none; border-color: #2d6a9f; }
        &.error { border-color: #dc3545; }
      }
    }

    .password-wrapper {
      position: relative;
      input { padding-right: 3rem; }
      .toggle-password {
        position: absolute; right: 0.75rem; top: 50%;
        transform: translateY(-50%);
        background: none; border: none; cursor: pointer; font-size: 1.1rem;
      }
    }

    .error-msg { color: #dc3545; font-size: 0.8rem; margin-top: 0.3rem; display: block; }

    .alert-error {
      background: #fff3cd; border: 1px solid #ffc107; color: #856404;
      padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;
    }

    .btn-login {
      width: 100%; padding: 0.9rem;
      background: linear-gradient(135deg, #1e3a5f, #2d6a9f);
      color: white; border: none; border-radius: 10px;
      font-size: 1rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;

      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(45, 106, 159, 0.4); }
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .login-demo {
      margin-top: 1.5rem; padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;

      p { color: #6c757d; font-size: 0.85rem; margin-bottom: 0.75rem; }

      .demo-accounts { display: flex; gap: 0.75rem; justify-content: center; }

      .demo-btn {
        padding: 0.5rem 1rem; border: 1px solid #dee2e6;
        border-radius: 8px; background: #f8f9fa; cursor: pointer;
        font-size: 0.85rem; transition: all 0.2s;
        &:hover { background: #e9ecef; }
      }
    }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  chargement = false;
  erreurConnexion = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  remplirDemo(email: string, motDePasse: string): void {
    this.loginForm.patchValue({ email, motDePasse });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.erreurConnexion = '';
    const { email, motDePasse } = this.loginForm.value;

    this.authService.login(email, motDePasse).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.erreurConnexion = err.error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
        this.chargement = false;
      },
    });
  }
}
