import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface MedStockUser {
  displayName: string;
  role: string;
  hospitalBranch: string;
}

export interface AuthResponse {
  token: string;
  username?: string;
  displayName?: string;
  role: string;
  hospitalBranch?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  currentUser = signal<MedStockUser | null>(null);

  private _accessToken: string | null =
    sessionStorage.getItem('medstock_access_token');

  readonly isAuthenticated = computed(
    () => this.currentUser() !== null
  );

  constructor() {
    const token = this._accessToken;

    if (token) {
      try {
        this.currentUser.set(this.profileFromToken(token, {
          token,
          role: 'Pharmacist'
        }));
      } catch {
        this.logoutState();
      }
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  getAccessToken(): string | null {
    return this._accessToken;
  }

  hasRole(role: string): boolean {
    return (
      this.currentUser()?.role.toLowerCase() ===
      role.toLowerCase()
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/auth/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  checkSession(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/api/auth/me`,
      { withCredentials: true }
    ).pipe(
      tap((res) => {
        this.currentUser.set({
          displayName:
            res.displayName ??
            res.username ??
            'Pharmacist',

          role: res.role ?? 'Pharmacist',

          hospitalBranch:
            res.hospitalBranch ??
            '4 Kilo'
        });
      }),
      catchError(() => {
        this.logoutState();
        return of(null);
      })
    );
  }

  private setSession(res: AuthResponse): void {
    this._accessToken = res.token;

    sessionStorage.setItem(
      'medstock_access_token',
      res.token
    );

    this.currentUser.set(
      this.profileFromToken(res.token, res)
    );
  }

  logout(): void {
    this.logoutState();
  }

  private logoutState(): void {
    this._accessToken = null;

    sessionStorage.removeItem(
      'medstock_access_token'
    );

    localStorage.removeItem('medstock_refresh');

    this.currentUser.set(null);
  }

  private profileFromToken(
    token: string,
    response: AuthResponse
  ): MedStockUser {
    try {
      const payload = JSON.parse(
        atob(
          token
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );

      return {
        displayName:
          payload.unique_name ??
          payload.name ??
          response.username ??
          response.displayName ??
          'Pharmacist',

        role:
          payload.role ??
          response.role ??
          'Pharmacist',

        hospitalBranch:
          payload.hospital_branch ??
          response.hospitalBranch ??
          '4 Kilo'
      };
    } catch {
      return {
        displayName:
          response.username ??
          response.displayName ??
          'Pharmacist',

        role:
          response.role ?? 'Pharmacist',

        hospitalBranch:
          response.hospitalBranch ??
          '4 Kilo'
      };
    }
  }
}

