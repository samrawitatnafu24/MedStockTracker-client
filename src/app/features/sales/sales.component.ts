
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InventoryDataService,
  SaleItem,
  SaleRequest
} from '../../services/inventory-data.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <h1>Sales</h1>
          <p class="subtitle">Manage recorded sales by medicine and hospital branch.</p>
        </div>
        <button class="add-btn" (click)="openAddForm()">+ Add Sale</button>
      </div>

      <p *ngIf="loading()">Loading sales...</p>
      <p class="error" *ngIf="error()">{{ error() }}</p>
      <p class="success" *ngIf="message()">{{ message() }}</p>

      <div class="form-card" *ngIf="showForm()">
        <h2>{{ editingId() ? 'Edit Sale' : 'Record New Sale' }}</h2>

        <form (ngSubmit)="saveSale()">
          <div class="form-grid">
            <label>
              Medicine ID
              <input
                type="number"
                name="medicineId"
                [(ngModel)]="form.medicineId"
                min="1"
                required
              />
            </label>

            <label>
              Quantity
              <input
                type="number"
                name="quantity"
                [(ngModel)]="form.quantity"
                min="1"
                required
              />
            </label>

            <label>
              Unit Price (ETB)
              <input
                type="number"
                name="unitPrice"
                [(ngModel)]="form.unitPrice"
                min="0.01"
                step="0.01"
                required
              />
            </label>

            <label>
              Customer Name
              <input
                type="text"
                name="customerName"
                [(ngModel)]="form.customerName"
                placeholder="Customer or hospital name"
                required
              />
            </label>

            <label>
              Hospital Branch
              <input
                type="text"
                name="hospitalBranch"
                [(ngModel)]="form.hospitalBranch"
                placeholder="e.g. 4 Kilo"
                required
              />
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (editingId() ? 'Update Sale' : 'Save Sale') }}
            </button>
            <button type="button" class="cancel-btn" (click)="closeForm()">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div class="table-wrap" *ngIf="!loading()">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Customer</th>
              <th>Branch</th>
              <th>Sale Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let s of sales()">
              <td>{{ s.id }}</td>
              <td>{{ s.medicineName }}</td>
              <td>{{ s.quantity }}</td>
              <td>{{ s.unitPrice | number:'1.2-2' }} ETB</td>
              <td>{{ s.totalAmount | number:'1.2-2' }} ETB</td>
              <td>{{ s.customerName || '—' }}</td>
              <td>{{ s.hospitalBranch || '—' }}</td>
              <td>{{ s.soldAt | date:'mediumDate' }}</td>
              <td class="actions">
                <button class="edit-btn" (click)="editSale(s)">Edit</button>
                <button class="delete-btn" (click)="deleteSale(s)">Delete</button>
              </td>
            </tr>

            <tr *ngIf="sales().length === 0">
              <td colspan="9" class="empty">No sales found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button class="refresh-btn" (click)="load()">Refresh</button>
    </section>
  `,
  styles: [`
    .page {
      color: #1e293b;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;
    }

    h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 20px;
    }

    .subtitle {
      color: #64748b;
      margin: 0;
    }

    .form-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 22px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 7px;
      font-size: 14px;
      font-weight: 600;
      color: #334155;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
    }

    input:focus {
      border-color: #059669;
      box-shadow: 0 0 0 2px rgba(5,150,105,.12);
    }

    button {
      border: none;
      border-radius: 8px;
      padding: 9px 14px;
      cursor: pointer;
      font-weight: 600;
    }

    button:disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .add-btn, .save-btn {
      background: #059669;
      color: white;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .cancel-btn, .refresh-btn {
      background: #e2e8f0;
      color: #334155;
    }

    .table-wrap {
      overflow-x: auto;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 950px;
    }

    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    th {
      background: #f8fafc;
      color: #475569;
      font-size: 13px;
    }

    .actions {
      display: flex;
      gap: 7px;
    }

    .edit-btn {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .delete-btn {
      background: #fee2e2;
      color: #b91c1c;
    }

    .refresh-btn {
      margin-top: 16px;
    }

    .error {
      color: #dc2626;
      margin: 12px 0;
    }

    .success {
      color: #059669;
      margin: 12px 0;
    }

    .empty {
      text-align: center;
      color: #64748b;
      padding: 24px;
    }

    @media (max-width: 600px) {
      .header {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class SalesComponent implements OnInit {
  private api = inject(InventoryDataService);

  sales = signal<SaleItem[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  message = signal('');
  showForm = signal(false);
  editingId = signal<number | null>(null);

  form: SaleRequest = this.emptyForm();

  ngOnInit(): void {
    this.load();
  }

  private emptyForm(): SaleRequest {
    return {
      medicineId: 0,
      quantity: 1,
      unitPrice: 0,
      customerName: '',
      hospitalBranch: '4 Kilo'
    };
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getSales().subscribe({
      next: data => {
        this.sales.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(
          err?.error?.message ||
          'Could not load sales. Check the API and login session.'
        );
        this.loading.set(false);
      }
    });
  }

  openAddForm(): void {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.error.set('');
    this.message.set('');
    this.showForm.set(true);
  }

  editSale(sale: SaleItem): void {
    this.form = {
      medicineId: sale.medicineId,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      customerName: sale.customerName || '',
      hospitalBranch: sale.hospitalBranch || '4 Kilo'
    };

    this.editingId.set(sale.id);
    this.error.set('');
    this.message.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form = this.emptyForm();
  }

  saveSale(): void {
    this.error.set('');
    this.message.set('');

    if (
      !this.form.medicineId ||
      this.form.medicineId < 1 ||
      !this.form.quantity ||
      this.form.quantity < 1 ||
      this.form.unitPrice <= 0 ||
      !this.form.customerName.trim() ||
      !this.form.hospitalBranch.trim()
    ) {
      this.error.set('Please enter valid sale information in all fields.');
      return;
    }

    this.saving.set(true);
    const id = this.editingId();

    const request = id
      ? this.api.updateSale(id, this.form)
      : this.api.createSale(this.form);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.message.set(id ? 'Sale updated successfully.' : 'Sale recorded successfully.');
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.error.set(
          err?.error?.message ||
          err?.error?.title ||
          'Could not save sale. Check medicine ID, available stock, and Admin login.'
        );
      }
    });
  }

  deleteSale(sale: SaleItem): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete sale #${sale.id}?`
    );

    if (!confirmed) return;

    this.error.set('');
    this.message.set('');

    this.api.deleteSale(sale.id).subscribe({
      next: () => {
        this.message.set('Sale deleted successfully.');
        this.load();
      },
      error: err => {
        this.error.set(
          err?.error?.message ||
          'Could not delete sale. Check your Admin login.'
        );
      }
    });
  }
}
