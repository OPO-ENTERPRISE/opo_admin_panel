import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { IUser, LoginRequest, LoginResponse, UserStats } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { AreaService } from './area.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'admin_token';
  private readonly USER_KEY = 'admin_user';

  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private areaService: AreaService) {
    this.initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuth(): void {
    // Buscar token con clave principal o alternativas
    let token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      const alternativeKeys = ['access_token', 'auth_token', 'token'];
      for (const key of alternativeKeys) {
        token = localStorage.getItem(key);
        if (token) {
          console.log(
            `🔍 AuthService.initializeAuth() - Token encontrado con clave alternativa: ${key}`
          );
          // Migrar el token a la clave principal
          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.removeItem(key); // Limpiar la clave alternativa
          break;
        }
      }
    }

    const user = localStorage.getItem(this.USER_KEY);

    if (token && user) {
      try {
        const userObj = JSON.parse(user);
        this.currentUserSubject.next(userObj);
        this.isAuthenticatedSubject.next(true);
        console.log('✅ AuthService.initializeAuth() - Usuario autenticado desde localStorage');
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.logout();
      }
    } else {
      console.log('🔍 AuthService.initializeAuth() - No hay token o usuario en localStorage');
    }
  }

  /**
   * Realiza el login del usuario administrador
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        console.log('🔍 AuthService.login() - Response:', response);

        // Guardar token y usuario en localStorage
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

        console.log(
          '✅ AuthService.login() - Token guardado:',
          response.token.substring(0, 20) + '...'
        );
        console.log('✅ AuthService.login() - Usuario guardado:', response.user);

        // Actualizar estado
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    // Actualizar estado
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Redirigir al login
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    console.log(this.TOKEN_KEY);
    // Buscar el token con la clave principal
    let token = localStorage.getItem(this.TOKEN_KEY);
    console.log(token);
    // Si no encuentra el token principal, buscar alternativos
    if (!token) {
      const alternativeKeys = ['access_token', 'auth_token', 'token'];
      for (const key of alternativeKeys) {
        token = localStorage.getItem(key);
        if (token) {
          console.log(`🔍 AuthService.getToken() - Token encontrado con clave alternativa: ${key}`);
          break;
        }
      }
    }

    console.log(
      '🔍 AuthService.getToken() - Token:',
      token ? `${token.substring(0, 20)}...` : 'No token'
    );
    console.log('🔍 AuthService.getToken() - TOKEN_KEY:', this.TOKEN_KEY);

    // Debug: mostrar todos los tokens disponibles
    this.debugAllTokens();

    return token;
  }

  /**
   * Debug: mostrar todos los tokens en localStorage
   */
  private debugAllTokens(): void {
    const possibleKeys = ['admin_token', 'access_token', 'auth_token', 'token', 'jwt_token'];
    const foundTokens: { [key: string]: string } = {};

    possibleKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        foundTokens[key] = value.substring(0, 20) + '...';
      }
    });

    console.log('🔍 AuthService.debugAllTokens() - Tokens disponibles:', foundTokens);
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtiene información del usuario administrador
   */
  getUserInfo(): Observable<IUser> {
    console.log('🔍 AuthService.getUserInfo() - Iniciando petición');
    console.log('🔍 AuthService.getUserInfo() - URL:', `${this.API_URL}/admin/user`);
    console.log('🔍 AuthService.getUserInfo() - Token disponible:', this.getToken() ? 'Sí' : 'No');

    return this.http.get<IUser>(`${this.API_URL}/admin/user`).pipe(
      tap((user) => {
        console.log('✅ AuthService.getUserInfo() - Respuesta exitosa:', user);
      }),
      catchError((error) => {
        console.error('❌ AuthService.getUserInfo() - Error:', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza información del usuario administrador
   */
  updateUser(userData: Partial<IUser>): Observable<IUser> {
    return this.http.put<IUser>(`${this.API_URL}/admin/user`, userData).pipe(
      tap((updatedUser) => {
        // Actualizar usuario en localStorage
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  /**
   * Cambia la contraseña del usuario
   */
  changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/admin/user/reset-password`,
      passwordData
    );
  }

  /**
   * Obtiene estadísticas del usuario
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API_URL}/admin/stats/user`);
  }

  /**
   * Verifica si el token es válido
   */
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    console.log('🔍 AuthService.validateToken() - Token disponible:', token ? 'Sí' : 'No');

    if (!token) {
      console.log('❌ AuthService.validateToken() - No hay token');
      return of(false);
    }

    console.log('🔍 AuthService.validateToken() - Validando token con endpoint /admin/user');
    console.log(
      '🔍 AuthService.validateToken() - Token que se enviará:',
      token.substring(0, 30) + '...'
    );

    return this.http.get(`${this.API_URL}/admin/user`).pipe(
      map((response) => {
        console.log('✅ AuthService.validateToken() - Token válido, respuesta:', response);
        return true;
      }),
      catchError((error) => {
        console.error('❌ AuthService.validateToken() - Token inválido:', error);
        console.error('❌ AuthService.validateToken() - Status:', error.status);
        console.error('❌ AuthService.validateToken() - Headers de respuesta:', error.headers);
        this.logout();
        return of(false);
      })
    );
  }

  /**
   * Obtiene el área del usuario actual (basado en appId del usuario)
   */
  getUserArea(): string {
    const user = this.getCurrentUser();
    return user?.appId === '1' ? 'PN' : 'PS';
  }

  /**
   * Obtiene el área seleccionada actualmente (puede ser diferente a la del usuario)
   */
  getSelectedArea(): string | null {
    const currentArea = this.areaService.getCurrentAreaSync();
    return currentArea?.id || null;
  }

  /**
   * Verifica si el usuario pertenece al área PN
   */
  isPNArea(): boolean {
    return this.getUserArea() === 'PN';
  }

  /**
   * Verifica si el usuario pertenece al área PS
   */
  isPSArea(): boolean {
    return this.getUserArea() === 'PS';
  }

  /**
   * Obtiene el área actual para mostrar (prioriza la seleccionada sobre la del usuario)
   */
  getDisplayArea(): string {
    const selectedArea = this.getSelectedArea();
    if (selectedArea) {
      return selectedArea === '1' ? 'PN' : 'PS';
    }
    return this.getUserArea();
  }

  /**
   * Método de prueba para verificar el interceptor
   */
  testInterceptor(): Observable<any> {
    console.log('🧪 AuthService.testInterceptor() - Probando interceptor...');
    return this.http.get(`${this.API_URL}/admin/user`);
  }
}
