import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AreaStats } from '../models/stats.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/admin/stats`;

  /**
   * Obtiene estadísticas de un área específica
   */
  getAreaStats(areaId: number | string): Observable<AreaStats> {
    return this.http.get<AreaStats>(`${this.API_URL}/area/${areaId}`);
  }

  /**
   * Obtiene estadísticas de todas las áreas
   */
  getAllAreasStats(): Observable<AreaStats[]> {
    return this.http.get<AreaStats[]>(`${this.API_URL}/areas`);
  }
}
