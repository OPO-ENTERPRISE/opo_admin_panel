import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SupportConversation } from '../models/support.model';

export interface SupportListResponse {
  items: SupportConversation[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  listConversations(filters?: { status?: string; search?: string; area?: number }): Observable<SupportListResponse> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.area) params = params.set('area', filters.area);

    return this.http.get<SupportListResponse>(`${this.baseUrl}/admin/support/conversations`, { params });
  }

  getConversation(id: string): Observable<{ conversation: SupportConversation }> {
    return this.http.get<{ conversation: SupportConversation }>(`${this.baseUrl}/admin/support/conversations/${id}`);
  }

  replyConversation(id: string, message: string, status?: string): Observable<{ conversation: SupportConversation; messageId: string }> {
    return this.http.post<{ conversation: SupportConversation; messageId: string }>(
      `${this.baseUrl}/admin/support/conversations/${id}/reply`,
      { message, status }
    );
  }

  markSeen(id: string): Observable<{ conversation: SupportConversation }> {
    return this.http.patch<{ conversation: SupportConversation }>(
      `${this.baseUrl}/admin/support/conversations/${id}/seen`,
      {}
    );
  }
}

