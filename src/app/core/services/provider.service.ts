import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdProvider,
  ProvidersResponse,
  CreateProviderRequest,
  UpdateProviderRequest,
  ProviderFilters,
} from '../models/provider.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private readonly API_URL = `${environment.apiUrl}/admin/providers`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de proveedores con paginación y filtros
   */
  getProviders(filters: ProviderFilters = {}): Observable<ProvidersResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.enabled !== undefined) params = params.set('enabled', filters.enabled.toString());

    return this.http.get<ProvidersResponse>(this.API_URL, { params });
  }

  /**
   * Obtiene un proveedor específico por ID
   */
  getProviderById(id: string): Observable<AdProvider> {
    return this.http.get<AdProvider>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea un nuevo proveedor
   */
  createProvider(providerData: CreateProviderRequest): Observable<AdProvider> {
    return this.http.post<AdProvider>(this.API_URL, providerData);
  }

  /**
   * Actualiza un proveedor existente
   */
  updateProvider(id: string, providerData: UpdateProviderRequest): Observable<AdProvider> {
    return this.http.put<AdProvider>(`${this.API_URL}/${id}`, providerData);
  }

  /**
   * Cambia el estado enabled/disabled de un proveedor
   */
  toggleProviderStatus(
    id: string,
    enabled: boolean
  ): Observable<{ id: string; enabled: boolean; message: string }> {
    return this.http.patch<{ id: string; enabled: boolean; message: string }>(
      `${this.API_URL}/${id}/enabled`,
      { enabled }
    );
  }

  /**
   * Elimina un proveedor
   */
  deleteProvider(id: string): Observable<{ message: string; deletedId: string }> {
    return this.http.delete<{ message: string; deletedId: string }>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene solo proveedores habilitados (para selectores)
   */
  getEnabledProviders(): Observable<ProvidersResponse> {
    return this.getProviders({ enabled: true, limit: 100 });
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
