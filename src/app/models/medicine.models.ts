export interface Medicine {
  id: number;
  name: string;
  sku?: string;
  batchNumber: string;
  quantity: number;
  minRequiredQuantity?: number;
  minimumQuantity: number;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
  expiryDate: string;
  price?: number;
  hospitalBranch?: string;
  reservedQuantity?: number;
  isExpired?: boolean;
  createdAt?: string;
  categoryId?: number;
  category?: unknown;
  holds?: unknown[];
}

export interface MedicinePagedResult {
  items: Medicine[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
