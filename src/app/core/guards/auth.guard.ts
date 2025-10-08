import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Verificar si el usuario está autenticado
    console.log('entro en el guard');

    if (!this.authService.isAuthenticated()) {
      console.log('no esta autenticado');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return of(false);
    }

    // Validar token con el servidor
    console.log('🔍 AuthGuard - Llamando a validateToken...');
    return this.authService.validateToken().pipe(
      map((isValid) => {
        console.log('🔍 AuthGuard - Resultado de validateToken:', isValid);
        if (!isValid) {
          console.log('❌ AuthGuard - Token no es válido');
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
        console.log('✅ AuthGuard - Token válido, permitiendo acceso');
        return true;
      }),
      catchError((error) => {
        console.error('❌ AuthGuard - Error en validateToken:', error);
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url },
        });
        return of(false);
      })
    );
  }
}
