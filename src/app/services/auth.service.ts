import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:9000/api/auth";
  constructor(private http: HttpClient) { }
  
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.storeTokens(response.access_token, response.refresh_token);
      })
    );
  }

  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  handleGoogleCallback(token: string, refreshToken: string): Observable<any> {
    this.storeTokens(token, refreshToken);
    return of({ success: true, token: token });
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    return this.http.post(`${this.apiUrl}/refresh-token`, { refresh_token: refreshToken }).pipe(
      tap((response: any) => {
        this.storeTokens(response.access_token, response.refresh_token);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
}