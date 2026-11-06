import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InventoryDataService,
  SupplierItem,
  PurchaseItem
} from '../../services/inventory-data.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>Suppliers</h1>
          <p>Manage supplier contact information and purchase history.</p>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="openAddForm()">
            + Add Supplier
          </button>
          <button class="btn btn-secondary" (click)="load()" [disabled]="loading()">
            ↻ Refresh
          </button>
        </div>
      </div>

      @if (successMessage()) {
        <div class="success">{{ successMessage() }}</div>
      }

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      @if (showForm()) {
        <section class="form-card">
          <h2>{{ editingSupplier() ? 'Edit Supplier' : 'Add New Supplier' }}</h2>

          @if (formError()) {
            <div class="error">{{ formError() }}</div>
          }

          <form (ngSubmit)="saveSupplier()">
            <div class="form-grid">
              <div class="field">
                <label>Supplier Name *</label>
                <input
                  name="name"
                  [(ngModel)]="form.name"
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              <div class="field">
                <label>Contact Person</label>
                <input
                  name="contactPerson"
                  [(ngModel)]="form.contactPerson"
                  placeholder="Contact person"
                />
              </div>

              <div class="field">
                <label>Phone</label>
                <input
                  name="phone"
                  [(ngModel)]="form.phone"
                  placeholder="Phone number"
                />
              </div>

              <div class="field">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  [(ngModel)]="form.email"
                  placeholder="Email address"
                />
              </div>

              <div class="field full">
                <label>Address</label>
                <input
                  name="address"
                  [(ngModel)]="form.address"
                  placeholder="Supplier address"
                />
              </div>
            </div>

            <div class="form-actions">
              <button class="btn btn-primary" type="submit" [disabled]="saving()">
                {{ saving() ? 'Saving...' : (editingSupplier() ? 'Update Supplier' : 'Save Supplier') }}
              </button>
              <button class="btn btn-secondary" type="button" (click)="cancelForm()">
                Cancel
              </button>
            </div>
          </form>
        </section>
      }

      <section class="table-card">
        <div class="section-heading">
          <h2>Supplier List</h2>
          <span class="count">{{ suppliers().length }} suppliers</span>
        </div>

        @if (loading()) {
          <div class="loading">Loading suppliers...</div>
        } @else if (suppliers().length === 0) {
          <div class="empty">No suppliers found.</div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Purchases</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                @for (supplier of suppliers(); track supplier.id) {
                  <tr>
                    <td>{{ supplier.id }}</td>
                    <td class="supplier-name">{{ supplier.name }}</td>
                    <td>{{ supplier.contactPerson || '-' }}</td>
                    <td>{{ supplier.phone || '-' }}</td>
                    <td>{{ supplier.email || '-' }}</td>
                    <td>{{ supplier.address || '-' }}</td>
                    <td>
                      <span class="purchase-count">{{ supplier.purchaseCount }}</span>
                    </td>
                    <td>
                      <div class="actions">
                        <button class="btn btn-history" (click)="viewHistory(supplier)">
                          History
                        </button>
                        <button class="btn btn-edit" (click)="openEditForm(supplier)">
                          Edit
                        </button>
                        <button
                          class="btn btn-delete"
                          (click)="deleteSupplier(supplier)"
                          [disabled]="deletingId() === supplier.id"
                        >
                          {{ deletingId() === supplier.id ? 'Deleting...' : 'Delete' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      @if (selectedSupplier()) {
        <section class="table-card history-card">
          <div class="section-heading">
            <div>
              <h2>Purchase History</h2>
              <p class="history-subtitle">
                Purchases from {{ selectedSupplier()?.name }}
              </p>
            </div>
            <button class="btn btn-secondary" (click)="closeHistory()">Close</button>
          </div>

          @if (purchasesLoading()) {
            <div class="loading">Loading purchase history...</div>
          } @else if (purchasesError()) {
            <div class="error">{{ purchasesError() }}</div>
          } @else if (supplierPurchases().length === 0) {
            <div class="empty">No purchase history for this supplier.</div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Purchase ID</th>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (purchase of supplierPurchases(); track purchase.id) {
                    <tr>
                      <td>{{ purchase.id }}</td>
                      <td>{{ purchase.medicineName }}</td>
                      <td>{{ purchase.quantity }}</td>
                      <td>{{ purchase.unitCost | number:'1.2-2' }}</td>
                      <td>{{ purchase.totalCost | number:'1.2-2' }}</td>
                      <td>
                        <span class="status" [class.received]="purchase.status.toLowerCase() === 'received'">
                          {{ purchase.status }}
                        </span>
                      </td>
                      <td>{{ purchase.purchasedAt | date:'mediumDate' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; color: #1e293b; }
    .page { padding: 24px; max-width: 1500px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    h1 { font-size: 28px; font-weight: 750; margin: 0 0 6px; color: #0f172a; }
    h2 { font-size: 19px; font-weight: 700; margin: 0; color: #0f172a; }
    p { margin: 0; color: #64748b; }
    .header-actions, .actions, .form-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn { border: 0; border-radius: 7px; padding: 9px 13px; font-weight: 600; cursor: pointer; font-size: 13px; }
    .btn:disabled { opacity: .55; cursor: not-allowed; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #e2e8f0; color: #334155; }
    .btn-history { background: #dbeafe; color: #1d4ed8; }
    .btn-edit { background: #fef3c7; color: #92400e; }
    .btn-delete { background: #fee2e2; color: #b91c1c; }
    .table-card, .form-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 22px; box-shadow: 0 2px 8px rgba(15,23,42,.04); }
    .form-card h2 { margin-bottom: 18px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 7px; }
    .field.full { grid-column: 1 / -1; }
    label { font-size: 13px; font-weight: 650; color: #475569; }
    input { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 7px; padding: 10px 12px; outline: none; font-size: 14px; }
    input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
    .form-actions { margin-top: 18px; }
    .section-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
    .count, .purchase-count { display: inline-block; background: #dbeafe; color: #1d4ed8; border-radius: 20px; padding: 5px 10px; font-size: 12px; font-weight: 700; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 900px; }
    th { background: #f8fafc; color: #64748b; font-size: 12px; text-align: left; padding: 13px 12px; white-space: nowrap; }
    td { border-top: 1px solid #e2e8f0; padding: 13px 12px; font-size: 13px; color: #475569; }
    .supplier-name { color: #0f172a; font-weight: 650; }
    .actions { min-width: 220px; }
    .loading, .empty { text-align: center; padding: 30px; color: #64748b; }
    .error, .success { padding: 12px 15px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
    .error { background: #fee2e2; color: #b91c1c; }
    .success { background: #dcfce7; color: #166534; }
    .history-card { margin-top: 24px; }
    .history-subtitle { margin-top: 5px; font-size: 13px; }
    .status { display: inline-block; padding: 5px 9px; border-radius: 20px; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 650; }
    .status.received { background: #dcfce7; color: #166534; }
    @media (max-width: 650px) {
      .page { padding: 14px; }
      .form-grid { grid-template-columns: 1fr; }
      .field.full { grid-column: auto; }
      .header { align-items: flex-start; }
    }
  `]
})
export class SuppliersComponent implements OnInit {
  private api = inject(InventoryDataService);

  suppliers = signal<SupplierItem[]>([]);
  purchases = signal<PurchaseItem[]>([]);
  selectedSupplier = signal<SupplierItem | null>(null);

  loading = signal(true);
  purchasesLoading = signal(false);
  error = signal('');
  purchasesError = signal('');

  showForm = signal(false);
  editingSupplier = signal<SupplierItem | null>(null);
  saving = signal(false);
  deletingId = signal<number | null>(null);
  formError = signal('');
  successMessage = signal('');

  form = {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getSuppliers().subscribe({
      next: (data) => this.suppliers.set(data),
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to load suppliers.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });

    this.api.getPurchases().subscribe({
      next: (data) => this.purchases.set(data),
      error: () => this.purchasesError.set('Unable to load purchase history.')
    });
  }

  openAddForm(): void {
    this.editingSupplier.set(null);
    this.form = {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: ''
    };
    this.formError.set('');
    this.successMessage.set('');
    this.showForm.set(true);
  }

  openEditForm(supplier: SupplierItem): void {
    this.editingSupplier.set(supplier);
    this.form = {
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    };
    this.formError.set('');
    this.successMessage.set('');
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingSupplier.set(null);
    this.formError.set('');
  }

  saveSupplier(): void {
    if (!this.form.name.trim()) {
      this.formError.set('Supplier name is required.');
      return;
    }

    const dto = {
      name: this.form.name.trim(),
      contactPerson: this.form.contactPerson.trim(),
      phone: this.form.phone.trim(),
      email: this.form.email.trim(),
      address: this.form.address.trim()
    };

    const editing = this.editingSupplier();
    this.saving.set(true);
    this.formError.set('');
    this.successMessage.set('');

    const request = editing
      ? this.api.updateSupplier(editing.id, dto)
      : this.api.createSupplier(dto);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingSupplier.set(null);
        this.successMessage.set(editing
          ? 'Supplier updated successfully.'
          : 'Supplier created successfully.');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(
          err?.error?.message ||
          (err?.status === 403 ? 'Only Admin users can manage suppliers.' :
          err?.status === 401 ? 'Please log in again.' :
          'Unable to save supplier. Please try again.')
        );
      }
    });
  }

  deleteSupplier(supplier: SupplierItem): void {
    this.successMessage.set('');
    this.error.set('');

    if (supplier.purchaseCount > 0) {
      this.error.set(
        'This supplier cannot be deleted because purchase history exists. You can still edit the supplier.'
      );
      return;
    }

    if (!confirm('Are you sure you want to delete "' + supplier.name + '"?')) {
      return;
    }

    this.deletingId.set(supplier.id);

    this.api.deleteSupplier(supplier.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.successMessage.set('Supplier deleted successfully.');

        if (this.selectedSupplier()?.id === supplier.id) {
          this.closeHistory();
        }

        this.load();
      },
      error: (err) => {
        this.deletingId.set(null);
        this.error.set(
          err?.error?.message ||
          (err?.status === 403 ? 'Only Admin users can delete suppliers.' :
          'Unable to delete supplier.')
        );
      }
    });
  }

  viewHistory(supplier: SupplierItem): void {
    this.selectedSupplier.set(supplier);
    this.purchasesError.set('');

    if (this.purchases().length > 0) {
      this.purchasesLoading.set(false);
      return;
    }

    this.purchasesLoading.set(true);
    this.api.getPurchases().subscribe({
      next: (data) => this.purchases.set(data),
      error: () => this.purchasesError.set('Unable to load purchase history.'),
      complete: () => this.purchasesLoading.set(false)
    });
  }

  supplierPurchases(): PurchaseItem[] {
    const supplier = this.selectedSupplier();
    if (!supplier) return [];

    return this.purchases().filter(
      purchase => purchase.supplierId === supplier.id
    );
  }

  closeHistory(): void {
    this.selectedSupplier.set(null);
    this.purchasesError.set('');
  }
}

