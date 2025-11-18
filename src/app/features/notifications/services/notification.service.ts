import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationStats,
  PaginatedNotificationResponse,
} from '../models/notification.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de notificaciones con paginación
   */
  getNotifications(page: number = 1, limit: number = 20): Observable<PaginatedNotificationResponse> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());

    return this.http.get<PaginatedNotificationResponse>(`${this.API_URL}/admin/notifications`, { params });
  }

  /**
   * Obtiene una notificación específica por ID
   */
  getNotificationById(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.API_URL}/admin/notifications/${id}`);
  }

  /**
   * Crea una nueva notificación
   */
  createNotification(notificationData: CreateNotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(`${this.API_URL}/admin/notifications`, notificationData);
  }

  /**
   * Actualiza una notificación existente
   */
  updateNotification(id: string, notificationData: UpdateNotificationRequest): Observable<Notification> {
    return this.http.put<Notification>(`${this.API_URL}/admin/notifications/${id}`, notificationData);
  }

  /**
   * Elimina una notificación
   */
  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/admin/notifications/${id}`);
  }

  /**
   * Activa o desactiva una notificación
   */
  toggleNotificationStatus(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.API_URL}/admin/notifications/${id}/enabled`, {});
  }

  /**
   * Obtiene estadísticas de una notificación
   */
  getNotificationStats(id: string): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.API_URL}/admin/notifications/${id}/stats`);
  }

  /**
   * Obtiene el nombre del área
   */
  getAreaName(area: number): string {
    if (area === 0) return 'Todas';
    return area === 1 ? 'PN' : 'PS';
  }

  /**
   * Obtiene el nombre completo del área
   */
  getAreaFullName(area: number): string {
    if (area === 0) return 'Todas las áreas';
    return area === 1 ? 'Policía Nacional' : 'Policía Local/Guardia Civil';
  }

  /**
   * Obtiene el nombre del tipo
   */
  getTypeName(type: string): string {
    return type === 'fixed' ? 'Fija' : 'Simple';
  }

  /**
   * Obtiene el nombre del tipo de acción
   */
  getActionTypeName(actionType: string): string {
    const actions: Record<string, string> = {
      update_app: 'Actualizar app',
      link: 'Enlace',
      acknowledge: 'Reconocer',
    };
    return actions[actionType] || actionType;
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
   * Verifica si una notificación está activa
   */
  isActive(notification: Notification): boolean {
    if (!notification.enabled) return false;

    const now = new Date();
    const startDate = new Date(notification.startDate);
    if (now < startDate) return false;

    if (notification.endDate) {
      const endDate = new Date(notification.endDate);
      if (now > endDate) return false;
    }

    return true;
  }
}

