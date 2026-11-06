import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryDataService, CategoryItem } from '../../services/inventory-data.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <h1>Medicine Categories</h1>
          <p class="subtitle">Manage your medicine categories and descriptions.</p>
        </div>
        <button class="primary" (click)="openAddForm()">+ Add Category</button>
      </div>

      <div class="stats">
        <div class="stat-card">
          <span>Total Categories</span>
          <strong>{{ categories().length }}</strong>
        </div>
        <div class="stat-card">
          <span>Medicines Assigned</span>
          <strong>{{ totalMedicines() }}</strong>
        </div>
      </div>

      <div class="toolbar">
        <input
          type="text"
          placeholder="Search category or description..."
          [(ngModel)]="searchTerm"
        />
        <button class="refresh" (click)="load()" [disabled]="loading()">↻ Refresh</button>
      </div>

      <div class="form-card" *ngIf="showForm()">
        <h2>{{ editingCategory() ? 'Edit Category' : 'Add New Category' }}</h2>

        <form (ngSubmit)="saveCategory()">
          <label>Category Name *</label>
          <input
            type="text"
            name="name"
            [(ngModel)]="form.name"
            placeholder="Enter category name"
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            [(ngModel)]="form.description"
            placeholder="Enter category description"
            rows="3"
          ></textarea>

          <p class="error" *ngIf="formError()">{{ formError() }}</p>

          <div class="form-actions">
            <button type="submit" class="primary" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (editingCategory() ? 'Update Category' : 'Save Category') }}
            </button>
            <button type="button" class="cancel" (click)="closeForm()">Cancel</button>
          </div>
        </form>
      </div>

      <p class="error message" *ngIf="error()">{{ error() }}</p>
      <p class="success message" *ngIf="success()">{{ success() }}</p>

      <div class="loading" *ngIf="loading()">Loading categories...</div>

      <div class="table-wrap" *ngIf="!loading()">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Medicines</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredCategories()">
              <td>#{{ item.id }}</td>
              <td class="category-name">{{ item.name }}</td>
              <td>{{ item.description || '—' }}</td>
              <td><span class="count">{{ item.medicineCount }}</span></td>
              <td>{{ item.createdAt | date:'mediumDate' }}</td>
              <td class="actions">
                <button class="edit" (click)="openEditForm(item)">Edit</button>
                <button
                  class="delete"
                  (click)="deleteCategory(item)"
                  [disabled]="item.medicineCount > 0"
                  [title]="item.medicineCount > 0 ? 'Cannot delete: medicines are assigned' : 'Delete category'"
                >Delete</button>
              </td>
            </tr>
            <tr *ngIf="filteredCategories().length === 0">
              <td colspan="6" class="empty">
                {{ searchTerm ? 'No matching categories found.' : 'No categories found. Add your first category.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .page{color:#1e293b;padding:24px}
    .header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px}
    h1{font-size:28px;font-weight:700;margin:0 0 8px}
    h2{font-size:20px;font-weight:700;margin:0 0 20px}
    .subtitle{color:#64748b;margin:0}
    button{border:0;border-radius:8px;padding:10px 15px;font-weight:600;cursor:pointer}
    button:disabled{opacity:.45;cursor:not-allowed}
    .primary{background:#059669;color:white}
    .stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:20px}
    .stat-card{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:8px}
    .stat-card span{color:#64748b;font-size:13px}
    .stat-card strong{font-size:25px;color:#0f172a}
    .toolbar{display:flex;gap:12px;margin-bottom:18px}
    input,textarea{width:100%;padding:11px 13px;border:1px solid #cbd5e1;border-radius:8px;outline:none;background:white;color:#1e293b}
    input:focus,textarea:focus{border-color:#059669}
    .toolbar input{max-width:420px}
    .refresh{background:#e2e8f0;color:#334155}
    .form-card{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:22px;margin-bottom:20px;max-width:650px}
    label{display:block;font-weight:600;margin:14px 0 7px}
    textarea{resize:vertical}
    .form-actions{display:flex;gap:10px;margin-top:18px}
    .cancel{background:#e2e8f0;color:#334155}
    .table-wrap{overflow-x:auto;background:white;border:1px solid #e2e8f0;border-radius:12px}
    table{width:100%;border-collapse:collapse;min-width:750px}
    th,td{text-align:left;padding:14px;border-bottom:1px solid #e2e8f0}
    th{background:#f8fafc;font-weight:600;color:#475569}
    td{font-size:14px}
    .category-name{font-weight:600;color:#0f172a}
    .count{background:#dcfce7;color:#166534;padding:5px 10px;border-radius:20px;font-weight:600}
    .actions{white-space:nowrap}
    .edit{background:#dbeafe;color:#1d4ed8;margin-right:7px}
    .delete{background:#fee2e2;color:#b91c1c}
    .empty,.loading{text-align:center;padding:28px;color:#64748b}
    .error{color:#dc2626}
    .success{color:#059669}
    .message{margin:12px 0}
    @media(max-width:650px){
      .page{padding:14px}
      .header{align-items:flex-start;flex-direction:column}
      .stats{grid-template-columns:1fr}
      .toolbar{flex-direction:column}
      .toolbar input{max-width:none}
    }
  `]
})
export class CategoriesComponent implements OnInit {
  private api = inject(InventoryDataService);

  categories = signal<CategoryItem[]>([]);
  loading = signal(false);
  saving = signal(false);
  showForm = signal(false);
  editingCategory = signal<CategoryItem | null>(null);
  error = signal('');
  formError = signal('');
  success = signal('');

  searchTerm = '';

  form = {
    name: '',
    description: ''
  };

  filteredCategories = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.categories();

    return this.categories().filter(item =>
      item.name.toLowerCase().includes(term) ||
      (item.description || '').toLowerCase().includes(term)
    );
  });

  totalMedicines = computed(() =>
    this.categories().reduce((total, item) => total + item.medicineCount, 0)
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getCategories().subscribe({
      next: data => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.error?.message || 'Could not load categories. Check that the API is running.');
        this.loading.set(false);
      }
    });
  }

  openAddForm(): void {
    this.editingCategory.set(null);
    this.form = { name: '', description: '' };
    this.formError.set('');
    this.success.set('');
    this.showForm.set(true);
  }

  openEditForm(item: CategoryItem): void {
    this.editingCategory.set(item);
    this.form = {
      name: item.name,
      description: item.description || ''
    };
    this.formError.set('');
    this.success.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCategory.set(null);
    this.formError.set('');
  }

  saveCategory(): void {
    const name = this.form.name.trim();

    if (!name) {
      this.formError.set('Category name is required.');
      return;
    }

    const dto = {
      name,
      description: this.form.description.trim()
    };

    this.saving.set(true);
    this.formError.set('');
    this.success.set('');

    const current = this.editingCategory();

    const request = current
      ? this.api.updateCategory(current.id, dto)
      : this.api.createCategory(dto);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.success.set(current ? 'Category updated successfully.' : 'Category created successfully.');
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(err?.error?.message || 'Could not save category. Check your Admin permission.');
      }
    });
  }

  deleteCategory(item: CategoryItem): void {
    if (item.medicineCount > 0) {
      this.error.set('This category cannot be deleted because medicines are assigned to it.');
      return;
    }

    if (!confirm('Are you sure you want to delete "' + item.name + '"?')) return;

    this.error.set('');
    this.success.set('');

    this.api.deleteCategory(item.id).subscribe({
      next: () => {
        this.success.set('Category deleted successfully.');
        this.load();
      },
      error: err => {
        this.error.set(err?.error?.message || 'Could not delete category.');
      }
    });
  }
}
