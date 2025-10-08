import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IArea, PREDEFINED_AREAS, AreaSelection } from '../models/area.model';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/admin/areas`;

  private readonly CURRENT_AREA_KEY = 'admin_current_area';
  private readonly AREA_SELECTION_KEY = 'admin_area_selection';

  private currentAreaSubject = new BehaviorSubject<IArea | null>(null);
  public currentArea$ = this.currentAreaSubject.asObservable();

  constructor() {
    this.loadCurrentArea();
  }

  // ========== Métodos CRUD Backend ==========

  /**
   * Obtiene áreas del backend con paginación
   */
  getAreasFromBackend(filters?: {
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<IArea>> {
    let params = new HttpParams();

    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedResponse<IArea>>(this.API_URL, { params });
  }

  /**
   * Obtiene un área específica por ID
   */
  getAreaById(id: string): Observable<IArea> {
    return this.http.get<IArea>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea una nueva área
   */
  createArea(area: Partial<IArea>): Observable<IArea> {
    return this.http.post<IArea>(this.API_URL, area);
  }

  /**
   * Actualiza un área existente
   */
  updateArea(id: string, area: Partial<IArea>): Observable<IArea> {
    return this.http.put<IArea>(`${this.API_URL}/${id}`, area);
  }

  /**
   * Toggle del estado enabled/disabled de un área
   */
  toggleAreaStatus(id: string, enabled: boolean): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}/enabled`, { enabled });
  }

  /**
   * Elimina un área
   */
  deleteArea(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene todas las áreas disponibles
   */
  getAreas(): Observable<IArea[]> {
    // Por ahora retornamos las áreas predefinidas
    // En el futuro se puede conectar con el backend
    return of(PREDEFINED_AREAS);
  }

  /**
   * Obtiene el área actualmente seleccionada
   */
  getCurrentArea(): Observable<IArea | null> {
    return this.currentArea$;
  }

  /**
   * Establece el área actual
   */
  setCurrentArea(area: IArea): void {
    this.currentAreaSubject.next(area);
    this.saveCurrentArea(area);
    this.saveAreaSelection(area);
  }

  /**
   * Obtiene el área actual de forma síncrona
   */
  getCurrentAreaSync(): IArea | null {
    return this.currentAreaSubject.value;
  }

  /**
   * Obtiene el ID del área actual
   */
  getCurrentAreaId(): string | null {
    const currentArea = this.getCurrentAreaSync();
    return currentArea?.id || null;
  }

  /**
   * Verifica si un área está seleccionada
   */
  hasAreaSelected(): boolean {
    return this.getCurrentAreaSync() !== null;
  }

  /**
   * Obtiene el nombre del área por ID
   */
  getAreaNameById(areaId: string): string {
    const area = PREDEFINED_AREAS.find((a) => a.id === areaId);
    return area?.name || 'Área Desconocida';
  }

  /**
   * Obtiene el icono del área por ID
   */
  getAreaIconById(areaId: string): string {
    const area = PREDEFINED_AREAS.find((a) => a.id === areaId);
    return area?.icon || 'help_outline';
  }

  /**
   * Obtiene el color del área por ID
   */
  getAreaColorById(areaId: string): string {
    const area = PREDEFINED_AREAS.find((a) => a.id === areaId);
    return area?.color || '#666666';
  }

  /**
   * Obtiene el historial de selecciones de área
   */
  getAreaSelectionHistory(): AreaSelection[] {
    try {
      const history = localStorage.getItem(this.AREA_SELECTION_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error cargando historial de áreas:', error);
      return [];
    }
  }

  /**
   * Limpia el área seleccionada
   */
  clearCurrentArea(): void {
    this.currentAreaSubject.next(null);
    localStorage.removeItem(this.CURRENT_AREA_KEY);
  }

  /**
   * Carga el área actual desde localStorage
   */
  private loadCurrentArea(): void {
    try {
      const savedArea = localStorage.getItem(this.CURRENT_AREA_KEY);
      if (savedArea) {
        const area: IArea = JSON.parse(savedArea);
        this.currentAreaSubject.next(area);
      } else {
        // Si no hay área guardada, seleccionar la primera por defecto
        const defaultArea = PREDEFINED_AREAS[0];
        if (defaultArea) {
          this.setCurrentArea(defaultArea);
        }
      }
    } catch (error) {
      console.error('Error cargando área actual:', error);
      this.currentAreaSubject.next(null);
    }
  }

  /**
   * Guarda el área actual en localStorage
   */
  private saveCurrentArea(area: IArea): void {
    try {
      localStorage.setItem(this.CURRENT_AREA_KEY, JSON.stringify(area));
    } catch (error) {
      console.error('Error guardando área actual:', error);
    }
  }

  /**
   * Guarda la selección de área en el historial
   */
  private saveAreaSelection(area: IArea): void {
    try {
      const history = this.getAreaSelectionHistory();
      const selection: AreaSelection = {
        area,
        selectedAt: new Date().toISOString(),
      };

      // Agregar al inicio del historial
      history.unshift(selection);

      // Mantener solo los últimos 10 elementos
      const limitedHistory = history.slice(0, 10);

      localStorage.setItem(this.AREA_SELECTION_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error guardando selección de área:', error);
    }
  }
}
