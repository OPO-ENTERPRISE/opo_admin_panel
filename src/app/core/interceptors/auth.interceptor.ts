import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  console.log('🚀 AuthInterceptor - INTERCEPTOR EJECUTÁNDOSE');

  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener token del servicio de autenticación
  const token = authService.getToken();

  console.log('🔍 AuthInterceptor - URL:', request.url);
  console.log('🔍 AuthInterceptor - Method:', request.method);
  console.log('🔍 AuthInterceptor - Token:', token ? `${token.substring(0, 20)}...` : 'No token');
  console.log('🔍 AuthInterceptor - Headers originales:', request.headers.keys());

  // Clonar la request y agregar el header de autorización si existe token
  if (token) {
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('✅ AuthInterceptor - Header Authorization agregado');
    console.log('🔍 AuthInterceptor - Headers finales:', clonedRequest.headers.keys());

    // Continuar con la request clonada
    return next(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores de autenticación
        if (error.status === 401) {
          // Token inválido o expirado
          console.error('Token inválido o expirado');
          authService.logout();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          // Sin permisos
          console.error('Sin permisos para realizar esta acción');
        }

        return throwError(() => error);
      })
    );
  } else {
    console.log('❌ AuthInterceptor - No hay token disponible');

    // Continuar con la request original
    return next(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores de autenticación
        if (error.status === 401) {
          // Token inválido o expirado
          console.error('Token inválido o expirado');
          authService.logout();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          // Sin permisos
          console.error('Sin permisos para realizar esta acción');
        }

        return throwError(() => error);
      })
    );
  }
};
