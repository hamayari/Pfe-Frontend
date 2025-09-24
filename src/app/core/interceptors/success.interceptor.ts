import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SuccessToastService } from '../services/success-toast.service';

@Injectable()
export class SuccessInterceptor implements HttpInterceptor {
  constructor(private toast: SuccessToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    return next.handle(req).pipe(
      tap(event => {
        if (isMutation && event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          const hint = req.headers.get('X-App-Action') || this.inferActionFromUrl(req.url, req.method);
          if (hint) {
            this.toast.show(`Succès: ${hint}`);
          }
        }
      })
    );
  }

  private inferActionFromUrl(url: string, method: string): string {
    const resource = url.split('?')[0].split('/').filter(Boolean).slice(-1)[0] || 'opération';
    switch (method) {
      case 'POST': return `création ${resource}`;
      case 'PUT': return `mise à jour ${resource}`;
      case 'PATCH': return `modification ${resource}`;
      case 'DELETE': return `suppression ${resource}`;
      default: return 'opération';
    }
  }
}




