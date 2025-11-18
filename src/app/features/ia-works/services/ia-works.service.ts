import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  UploadFileResponse,
  ProcessVectorRequest,
  ProcessVectorResponse,
} from '../models/embedding-config.model';

@Injectable({
  providedIn: 'root',
})
export class IaWorksService {
  private apiUrl = `${environment.apiUrl}/admin/ia-works`;

  constructor(private http: HttpClient) {}

  uploadAndConvert(file: File): Observable<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<UploadFileResponse>(`${this.apiUrl}/upload`, formData, {
      headers,
    });
  }

  processToVector(request: ProcessVectorRequest): Observable<ProcessVectorResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<ProcessVectorResponse>(`${this.apiUrl}/process`, request, {
      headers,
    });
  }
}

