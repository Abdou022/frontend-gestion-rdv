// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard fonctionnel Angular 17 qui protège les routes
 * Redirige vers /login si l'utilisateur n'est pas authentifié
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estConnecte()) {
    return true;
  }

  // Redirection vers login avec l'URL de retour
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
