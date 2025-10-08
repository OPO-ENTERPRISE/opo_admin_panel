import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private API_URL = environment.testApiUrl;

  constructor(private http: HttpClient) {}

  testCORS(): Observable<any> {
    return this.http.get(`${this.API_URL}/healthz`);
  }

  testLogin(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123',
    });
  }
}
