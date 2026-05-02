// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur HTTP qui ajoute automatiquement le token JWT
 * à toutes les requêtes sortantes
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const reqAvecToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(reqAvecToken);
  }

  return next(req);
};
