import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  medicineCount: number;
  createdAt: string;
}

export interface SupplierItem {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  purchaseCount: number;
  createdAt: string;
}

export interface PurchaseItem {
  id: number;
  medicineId: number;
  medicineName: string;
  supplierId: number;
  supplierName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: string;
  purchasedAt: string;
}

export interface PurchaseRequest {
  medicineId: number;
  supplierId: number;
  quantity: number;
  unitCost: number;
  status: string;
}

export interface SaleItem {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  hospitalBranch: string;
  soldAt: string;
}

export interface SaleRequest {
  medicineId: number;
  quantity: number;
  unitPrice: number;
  customerName: string;
  hospitalBranch: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryDataService {
  private http = inject(HttpClient);

  public readonly baseUrl = `${environment.apiUrl}/api/inventory-data`;

  getCategories(): Observable<CategoryItem[]> {
    return this.http.get<CategoryItem[]>(
      `${this.baseUrl}/categories`,
      { withCredentials: true }
    );
  }

  getSuppliers(): Observable<SupplierItem[]> {
    return this.http.get<SupplierItem[]>(
      `${this.baseUrl}/suppliers`,
      { withCredentials: true }
    );
  }

  getPurchases(): Observable<PurchaseItem[]> {
    return this.http.get<PurchaseItem[]>(
      `${this.baseUrl}/purchases`,
      { withCredentials: true }
    );
  }

  getSales(): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(
      `${this.baseUrl}/sales`,
      { withCredentials: true }
    );
  }

  createCategory(dto: Pick<CategoryItem, 'name' | 'description'>): Observable<CategoryItem> {
    return this.http.post<CategoryItem>(
      `${this.baseUrl}/categories`, dto, { withCredentials: true }
    );
  }

  updateCategory(id: number, dto: Pick<CategoryItem, 'name' | 'description'>): Observable<CategoryItem> {
    return this.http.put<CategoryItem>(
      `${this.baseUrl}/categories/${id}`, dto, { withCredentials: true }
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/categories/${id}`, { withCredentials: true }
    );
  }

  createSupplier(dto: Omit<SupplierItem, 'id' | 'purchaseCount' | 'createdAt'>): Observable<SupplierItem> {
    return this.http.post<SupplierItem>(
      `${this.baseUrl}/suppliers`, dto, { withCredentials: true }
    );
  }

  updateSupplier(id: number, dto: Omit<SupplierItem, 'id' | 'purchaseCount' | 'createdAt'>): Observable<SupplierItem> {
    return this.http.put<SupplierItem>(
      `${this.baseUrl}/suppliers/${id}`, dto, { withCredentials: true }
    );
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/suppliers/${id}`, { withCredentials: true }
    );
  }

  createPurchase(dto: PurchaseRequest): Observable<PurchaseItem> {
    return this.http.post<PurchaseItem>(
      `${this.baseUrl}/purchases`, dto, { withCredentials: true }
    );
  }

  updatePurchase(id: number, dto: PurchaseRequest): Observable<PurchaseItem> {
    return this.http.put<PurchaseItem>(
      `${this.baseUrl}/purchases/${id}`, dto, { withCredentials: true }
    );
  }

  deletePurchase(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/purchases/${id}`, { withCredentials: true }
    );
  }

  createSale(dto: SaleRequest): Observable<SaleItem> {
    return this.http.post<SaleItem>(
      `${this.baseUrl}/sales`,
      dto,
      { withCredentials: true }
    );
  }

  updateSale(id: number, dto: SaleRequest): Observable<SaleItem> {
    return this.http.put<SaleItem>(
      `${this.baseUrl}/sales/${id}`,
      dto,
      { withCredentials: true }
    );
  }

  deleteSale(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/sales/${id}`,
      { withCredentials: true }
    );
  }
}
