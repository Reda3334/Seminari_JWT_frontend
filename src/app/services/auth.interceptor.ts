import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  
  console.log("Dentro del interceptador");

  const token = localStorage.getItem('access_token');
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Attempt to refresh the token
          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              // Store the new tokens
              localStorage.setItem('access_token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);

              // Retry the failed request with the new token
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access_token}`
                }
              });
              return next(req);
            }),
            catchError(() => {
              // If refresh fails, log out the user
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              toastr.error(
                'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
                'Sesión Expirada',
                {
                  timeOut: 3000,
                  closeButton: true
                }
              );
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        } else {
          // No refresh token available, log out the user
          localStorage.removeItem('access_token');
          toastr.error(
            'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
            'Sesión Expirada',
            {
              timeOut: 3000,
              closeButton: true
            }
          );
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
}