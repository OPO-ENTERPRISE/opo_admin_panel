import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PrivacyPolicy,
  CreatePrivacyPolicyRequest,
  UpdatePrivacyPolicyRequest,
} from '../models/privacy-policy.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PrivacyPolicyService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las políticas de privacidad
   */
  getAll(): Observable<PrivacyPolicy[]> {
    return this.http.get<PrivacyPolicy[]>(`${this.API_URL}/admin/privacy-policies`);
  }

  /**
   * Obtiene una política de privacidad por área
   */
  getByArea(area: number): Observable<PrivacyPolicy> {
    return this.http.get<PrivacyPolicy>(`${this.API_URL}/admin/privacy-policies/area/${area}`);
  }

  /**
   * Crea una nueva política de privacidad
   */
  create(policyData: CreatePrivacyPolicyRequest): Observable<PrivacyPolicy> {
    return this.http.post<PrivacyPolicy>(`${this.API_URL}/admin/privacy-policies`, policyData);
  }

  /**
   * Actualiza una política de privacidad existente
   */
  update(area: number, policyData: UpdatePrivacyPolicyRequest): Observable<PrivacyPolicy> {
    return this.http.put<PrivacyPolicy>(
      `${this.API_URL}/admin/privacy-policies/area/${area}`,
      policyData
    );
  }

  /**
   * Elimina una política de privacidad
   */
  delete(area: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/admin/privacy-policies/area/${area}`);
  }
}



