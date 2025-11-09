import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class SuccessInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Only show success toasts for mutating requests (POST, PUT, PATCH, DELETE)
          const method = request.method.toUpperCase();
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const message = this.getSuccessMessage(method, request.url);
            this.snackBar.open(message, 'Fermer', {
              duration: 2500,
              panelClass: ['success-snackbar']
            });
          }
        }
      })
    );
  }

  private getSuccessMessage(method: string, url: string): string {
    if (method === 'POST') return 'Création effectuée avec succès';
    if (method === 'PUT' || method === 'PATCH') return 'Mise à jour effectuée avec succès';
    if (method === 'DELETE') return 'Suppression effectuée avec succès';
    return 'Opération effectuée avec succès';
  }
}






