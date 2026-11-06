import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InventoryDataService,
  PurchaseItem,
  PurchaseRequest,
  SupplierItem
} from '../../services/inventory-data.service';

import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine.models';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <h1>Purchases</h1>
          <p class="subtitle">Manage medicine purchases and supplier costs.</p>
        </div>
        <button class="primary" (click)="openAdd()">+ Add Purchase</button>
      </div>

      <div class="stats">
        <div class="stat-card">
          <span>Total Purchases</span>
          <strong>{{ purchases().length }}</strong>
        </div>
        <div class="stat-card">
          <span>Total Purchase Cost</span>
          <strong>ETB {{ totalCost() | number:'1.2-2' }}</strong>
        </div>
        <div class="stat-card">
          <span>Pending Purchases</span>
          <strong>{{ pendingCount() }}</strong>
        </div>
      </div>

      <p *ngIf="loading()" class="message">Loading purchases...</p>
      <p *ngIf="error()" class="error">{{ error() }}</p>

      <div class="form-card" *ngIf="showForm()">
        <h2>{{ editingId() === null ? 'Add New Purchase' : 'Edit Purchase' }}</h2>

        <p class="error" *ngIf="formError()">{{ formError() }}</p>

        <div class="form-grid">
          <label>
            Medicine
            <select [(ngModel)]="form.medicineId" [disabled]="editingId() !== null">
              <option [ngValue]="0">Select medicine</option>
              <option *ngFor="let m of medicines()" [ngValue]="m.id">
                {{ m.name }} - {{ m.batchNumber }}
              </option>
            </select>
          </label>

          <label>
            Supplier
            <select [(ngModel)]="form.supplierId">
              <option [ngValue]="0">Select supplier</option>
              <option *ngFor="let s of suppliers()" [ngValue]="s.id">
                {{ s.name }}
              </option>
            </select>
          </label>

          <label>
            Quantity
            <input type="number" min="1" [(ngModel)]="form.quantity">
          </label>

          <label>
            Unit Cost (ETB)
            <input type="number" min="0.01" step="0.01" [(ngModel)]="form.unitCost">
          </label>

          <label>
            Status
            <select [(ngModel)]="form.status">
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
            </select>
          </label>

          <div class="total-preview">
            <span>Total Cost</span>
            <strong>ETB {{ calculatedTotal() | number:'1.2-2' }}</strong>
          </div>
        </div>

        <div class="form-actions">
          <button class="primary" (click)="save()" [disabled]="saving()">
            {{ saving() ? 'Saving...' : (editingId() === null ? 'Save Purchase' : 'Update Purchase') }}
          </button>
          <button class="secondary" (click)="closeForm()" [disabled]="saving()">Cancel</button>
        </div>
      </div>

      <div class="table-wrap" *ngIf="!loading()">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Medicine</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of purchases()">
              <td>{{ p.id }}</td>
              <td>{{ p.medicineName }}</td>
              <td>{{ p.supplierName }}</td>
              <td>{{ p.quantity }}</td>
              <td>{{ p.unitCost | number:'1.2-2' }}</td>
              <td>{{ p.totalCost | number:'1.2-2' }}</td>
              <td>
                <span class="status" [class.received]="p.status.toLowerCase() === 'received'"
                  [class.pending]="p.status.toLowerCase() === 'pending'">
                  {{ p.status }}
                </span>
              </td>
              <td>{{ p.purchasedAt | date:'mediumDate' }}</td>
              <td class="actions">
                <button class="edit" (click)="openEdit(p)">Edit</button>
                <button class="delete" (click)="remove(p)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="purchases().length === 0">
              <td colspan="9" class="empty">No purchases found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button class="refresh" (click)="load()">Refresh</button>
    </section>
  `,
  styles: [`
    .page { color:#1e293b; padding:4px; }
    .header { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:22px; }
    h1 { font-size:28px; font-weight:700; margin:0 0 8px; }
    h2 { font-size:20px; font-weight:700; margin:0 0 20px; }
    .subtitle { color:#64748b; margin:0; }
    .stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-bottom:22px; }
    .stat-card { background:white; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:10px; }
    .stat-card span,.total-preview span { color:#64748b; font-size:13px; }
    .stat-card strong { font-size:22px; }
    .form-card { background:white; border:1px solid #e2e8f0; border-radius:12px; padding:22px; margin-bottom:22px; }
    .form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
    label { display:flex; flex-direction:column; gap:8px; font-size:14px; font-weight:600; }
    input,select { width:100%; box-sizing:border-box; border:1px solid #cbd5e1; border-radius:8px; padding:11px; background:white; color:#1e293b; }
    input:focus,select:focus { outline:2px solid #a7f3d0; border-color:#059669; }
    .total-preview { display:flex; flex-direction:column; justify-content:center; gap:8px; background:#ecfdf5; padding:12px; border-radius:8px; }
    .total-preview strong { font-size:20px; color:#047857; }
    .form-actions { display:flex; gap:10px; margin-top:20px; }
    button { border:0; border-radius:8px; padding:10px 15px; cursor:pointer; font-weight:600; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .primary { background:#059669; color:white; }
    .secondary,.refresh { background:#e2e8f0; color:#334155; }
    .table-wrap { overflow-x:auto; background:white; border:1px solid #e2e8f0; border-radius:12px; }
    table { width:100%; border-collapse:collapse; min-width:950px; }
    th,td { text-align:left; padding:13px; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
    th { background:#f8fafc; color:#475569; font-size:13px; }
    .status { display:inline-block; padding:5px 9px; border-radius:20px; font-size:12px; background:#e2e8f0; }
    .received { background:#dcfce7; color:#166534; }
    .pending { background:#fef3c7; color:#92400e; }
    .actions { display:flex; gap:7px; }
    .edit { background:#dbeafe; color:#1d4ed8; }
    .delete { background:#fee2e2; color:#b91c1c; }
    .refresh { margin-top:16px; }
    .error { color:#dc2626; margin:12px 0; }
    .message { color:#64748b; }
    .empty { text-align:center; color:#64748b; padding:24px; }
    @media(max-width:700px) {
      .header { align-items:flex-start; flex-direction:column; }
      .stats { grid-template-columns:1fr; }
      .form-grid { grid-template-columns:1fr; }
    }
  `]
})
export class PurchasesComponent implements OnInit {
  private api = inject(InventoryDataService);
  private medicineApi = inject(MedicineService);

  purchases = signal<PurchaseItem[]>([]);
  suppliers = signal<SupplierItem[]>([]);
  medicines = signal<Medicine[]>([]);

  loading = signal(true);
  saving = signal(false);
  error = signal('');
  formError = signal('');
  showForm = signal(false);
  editingId = signal<number | null>(null);

  form: PurchaseRequest = this.emptyForm();

  totalCost = () =>
    this.purchases().reduce((sum, p) => sum + Number(p.totalCost || 0), 0);

  pendingCount = () =>
    this.purchases().filter(p => p.status.toLowerCase() === 'pending').length;

  calculatedTotal = () =>
    (Number(this.form.quantity) || 0) * (Number(this.form.unitCost) || 0);

  ngOnInit(): void {
    this.load();
    this.loadSuppliers();
    this.loadMedicines();
  }

  private emptyForm(): PurchaseRequest {
    return {
      medicineId: 0,
      supplierId: 0,
      quantity: 1,
      unitCost: 0,
      status: 'Received'
    };
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getPurchases().subscribe({
      next: data => {
        this.purchases.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.error?.message || 'Could not load purchases. Check API and login session.');
        this.loading.set(false);
      }
    });
  }

  loadSuppliers(): void {
    this.api.getSuppliers().subscribe({
      next: data => this.suppliers.set(data),
      error: () => this.formError.set('Could not load suppliers.')
    });
  }

  loadMedicines(): void {
    this.medicineApi.getAll(1, 100).subscribe({
      next: result => this.medicines.set(result.items || []),
      error: () => this.formError.set('Could not load medicines.')
    });
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(p: PurchaseItem): void {
    this.form = {
      medicineId: p.medicineId,
      supplierId: p.supplierId,
      quantity: p.quantity,
      unitCost: p.unitCost,
      status: p.status
    };
    this.editingId.set(p.id);
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formError.set('');
    this.form = this.emptyForm();
  }

  save(): void {
    if (!this.form.medicineId || !this.form.supplierId ||
        this.form.quantity < 1 || this.form.unitCost <= 0) {
      this.formError.set('Please select medicine and supplier, and enter valid quantity and unit cost.');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const dto: PurchaseRequest = {
      medicineId: Number(this.form.medicineId),
      supplierId: Number(this.form.supplierId),
      quantity: Number(this.form.quantity),
      unitCost: Number(this.form.unitCost),
      status: this.form.status
    };

    const request = this.editingId() === null
      ? this.api.createPurchase(dto)
      : this.api.updatePurchase(this.editingId()!, dto);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(
          err?.error?.message || err?.error?.title ||
          'Could not save purchase. Check Admin permission and API.'
        );
      }
    });
  }

  remove(p: PurchaseItem): void {
    const confirmed = confirm(
      `Delete purchase #${p.id} for ${p.medicineName}? This may change medicine stock.`
    );

    if (!confirmed) return;

    this.api.deletePurchase(p.id).subscribe({
      next: () => this.load(),
      error: err => {
        this.error.set(
          err?.error?.message || err?.error?.title ||
          'Could not delete purchase. Check stock and Admin permission.'
        );
      }
    });
  }
}
