import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth header with jwt if user is logged in
    const tokens = this.getTokens();
    if (tokens?.accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from api
          localStorage.removeItem('user');
          localStorage.removeItem('tokens');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private getTokens(): { accessToken: string; refreshToken: string } | null {
    const tokens = localStorage.getItem('tokens');
    return tokens ? JSON.parse(tokens) : null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = localStorage.getItem('tokens');
  const parsedTokens = tokens ? JSON.parse(tokens) : null;

  if (parsedTokens?.accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${parsedTokens.accessToken}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Auto logout if 401 response returned from api
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
        // Note: We can't inject Router here, so we use window.location
        window.location.href = '/login';
      }
      return throwError(() => error);
    })
  );
}; 