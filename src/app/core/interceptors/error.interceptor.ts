import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Skip if it's an authentication URL or if the request is not an HTTP error
        if (request.url.includes('/auth/') || !(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }

        let errorMessage = 'An error occurred';
        let action = 'Close';
        let config = {
          duration: 5000,
          panelClass: ['error-snackbar']
        };

        // Handle different HTTP error statuses
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            break;
          case 400:
            errorMessage = this.getErrorMessage(error, 'Bad request');
            break;
          case 401:
            // 401 is handled by auth interceptor
            return throwError(() => error);
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            this.router.navigate(['/unauthorized']);
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 409:
            errorMessage = this.getErrorMessage(error, 'Conflict occurred');
            // Return the error to be handled by the component for specific field validation
            return throwError(() => error);
          case 422:
            errorMessage = 'Validation failed. Please check your input.';
            // Return the error to be handled by the component for form validation
            return throwError(() => error);
          case 500:
            errorMessage = 'A server error occurred. Please try again later.';
            break;
          case 503:
            errorMessage = 'The service is currently unavailable. Please try again later.';
            break;
          default:
            errorMessage = this.getErrorMessage(error, 'An unexpected error occurred');
        }

        // Show error message to the user
        this.snackBar.open(errorMessage, action, config);

        // Re-throw the error to be handled by the component if needed
        return throwError(() => error);
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse, defaultMessage: string): string {
    // Try to extract error message from the response
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      } else if (error.error.message) {
        return error.error.message;
      } else if (error.error.error) {
        return error.error.error;
      }
    }
    return defaultMessage;
  }
}
