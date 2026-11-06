import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Medicine,
  MedicinePagedResult
} from '../models/medicine.models';

import { StockHistory } from '../models/stock-history.models';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private http = inject(HttpClient);

  public readonly baseUrl = `${environment.apiUrl}/api/medicines`;

  getAll(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = ''
  ): Observable<MedicinePagedResult> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<MedicinePagedResult>(
      this.baseUrl,
      {
        params,
        withCredentials: true
      }
    );
  }

  create(medicine: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl,
      medicine,
      { withCredentials: true }
    );
  }

  update(id: number, medicine: any): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${id}`,
      medicine,
      { withCredentials: true }
    );
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`,
      { withCredentials: true }
    );
  }

  getStockHistory(medicineId: number): Observable<StockHistory[]> {
    return this.http.get<StockHistory[]>(
      `${this.baseUrl}/${medicineId}/stock-history`,
      { withCredentials: true }
    );
  }

  import(file: File): Observable<{ count: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ count: number }>(
      `${this.baseUrl}/import`,
      formData,
      { withCredentials: true }
    );
  }

  analytics(
    hospitalBranch: string
  ): Observable<{
    expiredQuantity: number;
    expiredValue: number;
    activeQuantity: number;
    activeValue: number;
  }> {
    return this.http.get<{
      expiredQuantity: number;
      expiredValue: number;
      activeQuantity: number;
      activeValue: number;
    }>(
      `${this.baseUrl}/analytics`,
      {
        params: { hospitalBranch },
        withCredentials: true
      }
    );
  }

  hold(
    id: number,
    payload: {
      patientName: string;
      note: string;
      durationHours: number;
    }
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${id}/holds`,
      payload,
      { withCredentials: true }
    );
  }
}
