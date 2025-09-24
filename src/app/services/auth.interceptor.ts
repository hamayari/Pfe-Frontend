import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

// Variable pour éviter les reconnexions multiples simultanées
let isReconnecting = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ne pas intercepter les requêtes d'authentification
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Éviter les boucles infinies - ne pas intercepter les requêtes de reconnexion
  if (req.url.includes('/signin')) {
    return next(req);
  }

  // Ajouter le token d'authentification
  let token = authService.getToken();
  
  // Si pas de token, essayer de se reconnecter immédiatement
  if (!token) {
    if (isReconnecting) {
      console.log('🔄 Reconnexion déjà en cours, attente...');
      return throwError(() => new Error('Reconnexion en cours'));
    }
    
    console.log('🔄 Pas de token trouvé, tentative de reconnexion immédiate...');
    isReconnecting = true;
    
    return authService.forceReconnect().pipe(
      switchMap((response) => {
        console.log('✅ Reconnexion réussie:', response);
        isReconnecting = false;
        const newToken = authService.getToken();
        if (newToken) {
          const newReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
          return next(newReq);
        } else {
          console.error('❌ Token non obtenu après reconnexion');
          return throwError(() => new Error('Token non obtenu après reconnexion'));
        }
      }),
      catchError((loginError) => {
        console.error('❌ Échec de la reconnexion:', loginError);
        isReconnecting = false;
        return throwError(() => loginError);
      })
    );
  }

  // Ajouter le token à la requête avec le préfixe Bearer
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (isReconnecting) {
          console.log('🔄 Reconnexion déjà en cours pour erreur 401...');
          return throwError(() => new Error('Reconnexion en cours'));
        }
        
        console.log('🔄 Erreur 401 détectée, tentative de reconnexion...');
        isReconnecting = true;
        
        // Forcer la reconnexion immédiate
        return authService.forceReconnect().pipe(
          switchMap((response) => {
            console.log('✅ Reconnexion réussie, retry de la requête');
            isReconnecting = false;
            const newToken = authService.getToken();
            if (newToken) {
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(newReq);
            } else {
              console.error('❌ Token non obtenu après reconnexion');
              return throwError(() => new Error('Token non obtenu après reconnexion'));
            }
          }),
          catchError((loginError) => {
            console.error('❌ Échec de la reconnexion:', loginError);
            isReconnecting = false;
            return throwError(() => loginError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

