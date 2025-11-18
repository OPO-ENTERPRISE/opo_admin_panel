import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Topic,
  TopicResponse,
  SubtopicsResponse,
  TopicStats,
  CreateTopicRequest,
  CreateTopicFormData,
  CreateSubtopicFormData,
  UpdateTopicRequest,
  ToggleTopicRequest,
  TogglePremiumRequest,
  SourceTopicInfo,
  CopyQuestionsRequest,
  CopyQuestionsResponse,
  UploadQuestionsRequest,
  UploadQuestionsResponse,
} from '../../../core/models/topic.model';
import { TopicFilters } from '../../../core/models/api.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de topics con paginación y filtros
   */
  getTopics(filters: TopicFilters = {}): Observable<TopicResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.area) params = params.set('area', filters.area);
    if (filters.enabled !== undefined) params = params.set('enabled', filters.enabled.toString());
    if (filters.premium !== undefined) params = params.set('premium', filters.premium.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.type) params = params.set('type', filters.type);

    return this.http.get<TopicResponse>(`${this.API_URL}/admin/topics`, { params });
  }

  /**
   * Obtiene un topic específico por ID
   */
  getTopicById(id: number): Observable<Topic> {
    return this.http.get<Topic>(`${this.API_URL}/admin/topics/${id}`);
  }

  /**
   * Obtiene los subtemas de un topic principal
   */
  getSubtopics(parentId: number): Observable<SubtopicsResponse> {
    return this.http.get<SubtopicsResponse>(`${this.API_URL}/admin/topics/${parentId}/subtopics`);
  }

  /**
   * Crea un nuevo topic
   */
  createTopic(topicData: CreateTopicFormData): Observable<Topic> {
    return this.http.post<Topic>(`${this.API_URL}/admin/topics`, topicData);
  }

  /**
   * Actualiza un topic existente
   */
  updateTopic(id: number, topicData: UpdateTopicRequest): Observable<Topic> {
    return this.http.put<Topic>(`${this.API_URL}/admin/topics/${id}`, topicData);
  }

  /**
   * Cambia el estado enabled/disabled de un topic
   */
  toggleTopicStatus(
    id: number,
    enabled: boolean
  ): Observable<{ _id: string; enabled: boolean; message: string }> {
    const request: ToggleTopicRequest = { enabled };
    return this.http.patch<{ _id: string; enabled: boolean; message: string }>(
      `${this.API_URL}/admin/topics/${id}/enabled`,
      request
    );
  }

  /**
   * Cambia el estado premium/no-premium de un topic
   */
  toggleTopicPremium(
    id: number,
    premium: boolean
  ): Observable<{ _id: string; premium: boolean; message: string }> {
    const request: TogglePremiumRequest = { premium };
    return this.http.patch<{ _id: string; premium: boolean; message: string }>(
      `${this.API_URL}/admin/topics/${id}/premium`,
      request
    );
  }

  /**
   * Elimina un topic
   */
  deleteTopic(id: number): Observable<{ message: string; deletedId: string }> {
    return this.http.delete<{ message: string; deletedId: string }>(
      `${this.API_URL}/admin/topics/${id}`
    );
  }

  /**
   * Obtiene estadísticas de topics
   */
  getTopicStats(): Observable<TopicStats> {
    return this.http.get<TopicStats>(`${this.API_URL}/admin/stats/topics`);
  }

  /**
   * Obtiene topics por área (para el frontend de la app)
   */
  getTopicsByArea(areaId: number): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.API_URL}/topics/area/${areaId}`);
  }

  /**
   * Genera un UUID único para nuevos topics
   */
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Genera un ID único para nuevos topics
   */
  generateId(): number {
    return Math.floor(Math.random() * 10000);
  }

  /**
   * Valida si un topic es principal (id === rootId)
   */
  isMainTopic(topic: Topic): boolean {
    return topic.id === topic.rootId;
  }

  /**
   * Valida si un topic es subtema (id !== rootId)
   */
  isSubtopic(topic: Topic): boolean {
    return topic.id !== topic.rootId;
  }

  /**
   * Obtiene el nombre del área
   */
  getAreaName(area: number): string {
    return area === 1 ? 'PN' : 'PS';
  }

  /**
   * Obtiene el nombre completo del área
   */
  getAreaFullName(area: number): string {
    return area === 1 ? 'Policía Nacional' : 'Policía Local/Guardia Civil';
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
   * Calcula el porcentaje de topics habilitados
   */
  calculateEnabledPercentage(total: number, enabled: number): number {
    if (total === 0) return 0;
    return Math.round((enabled / total) * 100);
  }

  /**
   * Obtiene el nombre del tipo de topic
   */
  getTypeName(type: string): string {
    const types: Record<string, string> = {
      topic: 'Temas',
      exam: 'Exámenes Oficiales',
      misc: 'Miscelánea',
    };
    return types[type] || type;
  }

  /**
   * Obtiene el icono del tipo de topic
   */
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      topic: 'menu_book',
      exam: 'description',
      misc: 'folder_special',
    };
    return icons[type] || 'topic';
  }

  /**
   * Obtiene temas disponibles de otras áreas como fuente de preguntas
   */
  getAvailableSourceTopics(topicId: number): Observable<SourceTopicInfo[]> {
    return this.http.get<SourceTopicInfo[]>(
      `${this.API_URL}/admin/topics/${topicId}/available-sources`
    );
  }

  /**
   * Copia preguntas desde temas origen al tema destino
   */
  copyQuestionsFromTopics(
    topicId: number,
    request: CopyQuestionsRequest
  ): Observable<CopyQuestionsResponse> {
    return this.http.post<CopyQuestionsResponse>(
      `${this.API_URL}/admin/topics/${topicId}/copy-questions`,
      request
    );
  }

  /**
   * Sube preguntas desde un JSON a un topic específico
   */
  uploadQuestionsToTopic(
    topicId: number,
    request: UploadQuestionsRequest
  ): Observable<UploadQuestionsResponse> {
    return this.http.post<UploadQuestionsResponse>(
      `${this.API_URL}/admin/topics/${topicId}/upload-questions`,
      request
    );
  }

  /**
   * Crea un nuevo subtopic bajo un topic principal
   */
  createSubtopic(parentTopicId: number, subtopicData: CreateSubtopicFormData): Observable<Topic> {
    return this.http.post<Topic>(
      `${this.API_URL}/admin/topics/${parentTopicId}/subtopics`,
      subtopicData
    );
  }
}
