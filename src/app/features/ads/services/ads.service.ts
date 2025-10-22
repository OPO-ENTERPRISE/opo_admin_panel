import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ad, CreateAdRequest, UpdateAdRequest, AdFilters } from '../../../core/models/ad.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdsService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de anuncios con filtros opcionales
   */
  getAds(filters: AdFilters = {}): Observable<Ad[]> {
    let params = new HttpParams();

    if (filters.active !== undefined) params = params.set('active', filters.active.toString());
    if (filters.appScreen) params = params.set('appScreen', filters.appScreen);
    if (filters.provider) params = params.set('provider', filters.provider);
    if (filters.type) params = params.set('type', filters.type);

    return this.http.get<Ad[]>(`${this.API_URL}/ads`, { params });
  }

  /**
   * Obtiene un anuncio específico por ID
   */
  getAdById(id: string): Observable<Ad> {
    return this.http.get<Ad>(`${this.API_URL}/ads/${id}`);
  }

  /**
   * Crea un nuevo anuncio
   */
  createAd(adData: CreateAdRequest): Observable<Ad> {
    return this.http.post<Ad>(`${this.API_URL}/ads`, adData);
  }

  /**
   * Actualiza un anuncio existente
   */
  updateAd(id: string, adData: UpdateAdRequest): Observable<Ad> {
    return this.http.put<Ad>(`${this.API_URL}/ads/${id}`, adData);
  }

  /**
   * Elimina un anuncio
   */
  deleteAd(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/ads/${id}`);
  }

  /**
   * Cambia el estado activo/inactivo de un anuncio
   */
  toggleActiveStatus(id: string, active: boolean): Observable<Ad> {
    return this.updateAd(id, { active } as UpdateAdRequest);
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

  /**
   * Obtiene el nombre legible del proveedor
   */
  getProviderLabel(provider: string): string {
    const providers: Record<string, string> = {
      admob: 'AdMob',
      facebook: 'Facebook',
      custom: 'Personalizado',
    };
    return providers[provider] || provider;
  }

  /**
   * Obtiene el nombre legible del tipo de anuncio
   */
  getTypeLabel(type: string): string {
    const types: Record<string, string> = {
      banner: 'Banner',
      interstitial: 'Intersticial',
      video: 'Video',
    };
    return types[type] || type;
  }

  /**
   * Obtiene el nombre legible de la pantalla
   */
  getScreenLabel(screen: string): string {
    const screens: Record<string, string> = {
      home: 'Inicio',
      test: 'Test',
      results: 'Resultados',
      topics: 'Temas',
      history: 'Historial',
    };
    return screens[screen] || screen;
  }
}
