import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../models/user.model';
import { PaginatedResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/admin/users`;

  /**
   * Obtiene usuarios del backend con paginación y filtro por área
   */
  getUsers(filters?: {
    page?: number;
    limit?: number;
    area?: string;
  }): Observable<PaginatedResponse<IUser>> {
    let params = new HttpParams();

    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters?.area) {
      params = params.set('area', filters.area);
    }

    return this.http.get<PaginatedResponse<IUser>>(this.API_URL, { params });
  }

  /**
   * Toggle del estado enabled/disabled de un usuario
   */
  toggleUserStatus(id: string, enabled: boolean): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}/enabled`, { enabled });
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
