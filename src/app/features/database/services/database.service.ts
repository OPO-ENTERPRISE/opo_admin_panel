import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DatabaseStats } from '../../../core/models/database.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene estadísticas de la base de datos
   */
  getStats(): Observable<DatabaseStats> {
    return this.http.get<DatabaseStats>(`${this.API_URL}/admin/database/stats`);
  }

  /**
   * Descarga un backup de la base de datos
   */
  downloadBackup(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/admin/database/download`, {
      responseType: 'blob',
    });
  }
}
