
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Medicine } from '../../models/medicine.models';
import { StockHistory } from '../../models/stock-history.models';

import { MedicineStore } from '../../store/medicine.store';
import { MedicineService } from '../../services/medicine.service';

@Component({
  selector: 'app-medicines',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicines.component.html',
  styleUrl: './medicines.component.css'
})
export class MedicinesComponent implements OnInit {

  readonly store = inject(MedicineStore);
  private readonly medicineService = inject(MedicineService);

  // =====================================================
  // SEARCH AND FILTER
  // =====================================================

  readonly searchTerm = signal('');
  readonly selectedBranch = signal('');

  // =====================================================
  // PAGINATION
  // =====================================================

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(
        this.filteredMedicines().length / this.pageSize()
      )
    )
  );

  readonly paginatedMedicines = computed(() => {
    const medicines = this.filteredMedicines();

    const start =
      (this.currentPage() - 1) * this.pageSize();

    return medicines.slice(
      start,
      start + this.pageSize()
    );
  });

  readonly pageNumbers = computed(() =>
    Array.from(
      { length: this.totalPages() },
      (_, index) => index + 1
    )
  );

  readonly startItem = computed(() => {
    const total = this.filteredMedicines().length;

    if (total === 0) {
      return 0;
    }

    return (
      (this.currentPage() - 1) *
      this.pageSize()
    ) + 1;
  });

  readonly endItem = computed(() =>
    Math.min(
      this.currentPage() * this.pageSize(),
      this.filteredMedicines().length
    )
  );

  goToPage(page: number): void {
    if (
      page >= 1 &&
      page <= this.totalPages()
    ) {
      this.currentPage.set(page);
    }
  }

  // =====================================================
  // FORMS
  // =====================================================

  readonly showAddForm = signal(false);
  readonly showEditForm = signal(false);

  readonly isSaving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly editingMedicineId =
    signal<number | null>(null);

  // =====================================================
  // STOCK HISTORY
  // =====================================================

  readonly stockHistory =
    signal<StockHistory[]>([]);

  readonly selectedHistoryMedicine =
    signal<Medicine | null>(null);

  readonly isLoadingHistory = signal(false);

  // =====================================================
  // ADD MEDICINE MODEL
  // =====================================================

  readonly newMedicine = {
    name: '',
    batchNumber: '',
    quantity: 0,
    price: 0,
    expiryDate: '',
    hospitalBranch: '4 Kilo',
    minimumQuantity: 50
  };

  // =====================================================
  // EDIT MEDICINE MODEL
  // =====================================================

  readonly editMedicine = {
    name: '',
    batchNumber: '',
    quantity: 0,
    price: 0,
    expiryDate: '',
    hospitalBranch: '4 Kilo',
    minimumQuantity: 50
  };

  // =====================================================
  // BRANCHES
  // =====================================================

  readonly branches = computed(() => {

    const medicines = this.store.entities();

    return Array.from(
      new Set(
        medicines
          .map(medicine =>
            medicine.hospitalBranch ?? ''
          )
          .filter(branch =>
            branch.trim().length > 0
          )
      )
    ).sort();

  });

  // =====================================================
  // FILTERED MEDICINES
  // =====================================================

  readonly filteredMedicines = computed(() => {

    const term =
      this.searchTerm().trim().toLowerCase();

    const branch = this.selectedBranch();

    return this.store.entities().filter(
      (medicine: Medicine) => {

        const name =
          medicine.name?.toLowerCase() ?? '';

        const batch =
          medicine.batchNumber?.toLowerCase() ?? '';

        const hospitalBranch =
          medicine.hospitalBranch?.toLowerCase() ?? '';

        const matchesSearch =
          !term ||
          name.includes(term) ||
          batch.includes(term) ||
          hospitalBranch.includes(term);

        const matchesBranch =
          !branch ||
          medicine.hospitalBranch === branch;

        return matchesSearch && matchesBranch;

      }
    );

  });

  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.store.loadMedicines({});

    this.store.listenForLiveStockUpdates();

  }

  // =====================================================
  // SEARCH
  // =====================================================

  onSearch(value: string): void {

    this.searchTerm.set(value);

    this.currentPage.set(1);

  }

  // =====================================================
  // BRANCH FILTER
  // =====================================================

  onBranchChange(value: string): void {

    this.selectedBranch.set(value);

    this.currentPage.set(1);

  }

  // =====================================================
  // ADD MEDICINE
  // =====================================================

  openAddForm(): void {

    this.formError.set(null);

    this.showEditForm.set(false);

    this.showAddForm.set(true);

  }

  closeAddForm(): void {

    this.showAddForm.set(false);

    this.formError.set(null);

  }

  addMedicine(): void {

    this.formError.set(null);

    if (!this.newMedicine.name.trim()) {
      this.formError.set(
        'Medicine name is required.'
      );
      return;
    }

    if (!this.newMedicine.batchNumber.trim()) {
      this.formError.set(
        'Batch number is required.'
      );
      return;
    }

    if (this.newMedicine.quantity < 0) {
      this.formError.set(
        'Quantity cannot be negative.'
      );
      return;
    }

    if (this.newMedicine.minimumQuantity < 0) {
      this.formError.set(
        'Minimum quantity cannot be negative.'
      );
      return;
    }

    if (this.newMedicine.price < 0) {
      this.formError.set(
        'Price cannot be negative.'
      );
      return;
    }

    if (!this.newMedicine.expiryDate) {
      this.formError.set(
        'Expiry date is required.'
      );
      return;
    }

    if (!this.newMedicine.hospitalBranch.trim()) {
      this.formError.set(
        'Hospital branch is required.'
      );
      return;
    }

    this.isSaving.set(true);

    const payload = {
      name: this.newMedicine.name.trim(),

      batchNumber:
        this.newMedicine.batchNumber.trim(),

      quantity:
        Number(this.newMedicine.quantity),

      price:
        Number(this.newMedicine.price),

      expiryDate:
        new Date(
          this.newMedicine.expiryDate
        ).toISOString(),

      hospitalBranch:
        this.newMedicine.hospitalBranch.trim(),

      minimumQuantity:
        Number(this.newMedicine.minimumQuantity)
    };

    this.medicineService.create(payload).subscribe({

      next: () => {

        this.isSaving.set(false);

        this.closeAddForm();

        this.newMedicine.name = '';
        this.newMedicine.batchNumber = '';
        this.newMedicine.quantity = 0;
        this.newMedicine.price = 0;
        this.newMedicine.expiryDate = '';
        this.newMedicine.hospitalBranch = '4 Kilo';
        this.newMedicine.minimumQuantity = 50;

        this.currentPage.set(1);

        this.store.loadMedicines({});

      },

      error: (error) => {

        this.isSaving.set(false);

        this.formError.set(
          error?.error?.message ||
          error?.error?.title ||
          error?.message ||
          'Failed to create medicine.'
        );

      }

    });

  }

  // =====================================================
  // EDIT MEDICINE
  // =====================================================

  openEditForm(medicine: Medicine): void {

    this.formError.set(null);

    this.showAddForm.set(false);

    this.editingMedicineId.set(medicine.id);

    this.editMedicine.name =
      medicine.name ?? '';

    this.editMedicine.batchNumber =
      medicine.batchNumber ?? '';

    this.editMedicine.quantity =
      medicine.quantity ?? 0;

    this.editMedicine.price =
      medicine.price ?? 0;

    this.editMedicine.expiryDate =
      medicine.expiryDate
        ? medicine.expiryDate.substring(0, 10)
        : '';

    this.editMedicine.hospitalBranch =
      medicine.hospitalBranch ?? '4 Kilo';

    this.editMedicine.minimumQuantity =
      medicine.minimumQuantity ?? 50;

    this.showEditForm.set(true);

  }

  closeEditForm(): void {

    this.showEditForm.set(false);

    this.editingMedicineId.set(null);

    this.formError.set(null);

  }

  updateMedicine(): void {

    this.formError.set(null);

    const id = this.editingMedicineId();

    if (id === null) {

      this.formError.set(
        'Medicine ID is missing.'
      );

      return;

    }

    if (!this.editMedicine.name.trim()) {

      this.formError.set(
        'Medicine name is required.'
      );

      return;

    }

    if (!this.editMedicine.batchNumber.trim()) {

      this.formError.set(
        'Batch number is required.'
      );

      return;

    }

    if (this.editMedicine.quantity < 0) {

      this.formError.set(
        'Quantity cannot be negative.'
      );

      return;

    }

    if (this.editMedicine.minimumQuantity < 0) {

      this.formError.set(
        'Minimum quantity cannot be negative.'
      );

      return;

    }

    if (this.editMedicine.price < 0) {

      this.formError.set(
        'Price cannot be negative.'
      );

      return;

    }

    if (!this.editMedicine.expiryDate) {

      this.formError.set(
        'Expiry date is required.'
      );

      return;

    }

    if (!this.editMedicine.hospitalBranch.trim()) {

      this.formError.set(
        'Hospital branch is required.'
      );

      return;

    }

    this.isSaving.set(true);

    const payload = {

      name:
        this.editMedicine.name.trim(),

      batchNumber:
        this.editMedicine.batchNumber.trim(),

      quantity:
        Number(this.editMedicine.quantity),

      price:
        Number(this.editMedicine.price),

      expiryDate:
        new Date(
          this.editMedicine.expiryDate
        ).toISOString(),

      hospitalBranch:
        this.editMedicine.hospitalBranch.trim(),

      minimumQuantity:
        Number(this.editMedicine.minimumQuantity)

    };

    this.medicineService.update(
      id,
      payload
    ).subscribe({

      next: () => {

        this.isSaving.set(false);

        this.closeEditForm();

        this.store.loadMedicines({});

      },

      error: (error) => {

        this.isSaving.set(false);

        this.formError.set(
          error?.error?.message ||
          error?.error?.title ||
          error?.message ||
          'Failed to update medicine.'
        );

      }

    });

  }

  // =====================================================
  // DELETE MEDICINE
  // =====================================================

  deleteMedicine(medicine: Medicine): void {

    const confirmed = window.confirm(
      `Are you sure you want to delete "${medicine.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.formError.set(null);

    this.isSaving.set(true);

    this.medicineService
      .remove(medicine.id)
      .subscribe({

        next: () => {

          this.isSaving.set(false);

          this.store.loadMedicines({});

        },

        error: (error) => {

          this.isSaving.set(false);

          this.formError.set(
            error?.error?.message ||
            error?.error?.title ||
            error?.message ||
            'Failed to delete medicine.'
          );

        }

      });

  }

  // =====================================================
  // STOCK HISTORY
  // =====================================================

  viewStockHistory(medicine: Medicine): void {

    this.formError.set(null);

    this.selectedHistoryMedicine.set(medicine);

    this.stockHistory.set([]);

    this.isLoadingHistory.set(true);

    this.medicineService
      .getStockHistory(medicine.id)
      .subscribe({

        next: (history: StockHistory[]) => {

          this.stockHistory.set(history);

          this.isLoadingHistory.set(false);

        },

        error: (error) => {

          this.isLoadingHistory.set(false);

          this.formError.set(
            error?.error?.message ||
            error?.error?.title ||
            error?.message ||
            'Failed to load stock history.'
          );

        }

      });

  }

  closeStockHistory(): void {

    this.selectedHistoryMedicine.set(null);

    this.stockHistory.set([]);

    this.isLoadingHistory.set(false);

    this.formError.set(null);

  }

  // =====================================================
  // MEDICINE STATUS
  // =====================================================

  getStatus(medicine: Medicine): string {

    const expiryDate =
      medicine.expiryDate?.substring(0, 10);

    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');

    // EXPIRED
    if (
      medicine.isExpired ||
      (expiryDate && expiryDate < todayString)
    ) {
      return 'Expired';
    }

    // OUT OF STOCK
    if (medicine.quantity <= 0) {
      return 'OutOfStock';
    }

    // LOW STOCK
    if (
      medicine.quantity <=
      medicine.minimumQuantity
    ) {
      return 'LowStock';
    }

    // IN STOCK
    return 'InStock';

  }

  // =====================================================
  // STATUS CSS CLASS
  // =====================================================

  getStatusClass(medicine: Medicine): string {

    return this.getStatus(medicine).toLowerCase();

  }

  // =====================================================
  // EXPIRY WARNING
  // =====================================================

  getDaysUntilExpiry(medicine: Medicine): number | null {

    if (!medicine.expiryDate) {
      return null;
    }

    const expiry = new Date(
      medicine.expiryDate.substring(0, 10) +
      'T00:00:00'
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const difference =
      expiry.getTime() - today.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

  }

  isExpiringSoon(medicine: Medicine): boolean {

    const days = this.getDaysUntilExpiry(medicine);

    return (
      days !== null &&
      days >= 0 &&
      days <= 30
    );

  }


  // STATUS SUMMARY COUNTS

  readonly expiredCount = computed(() =>
    this.filteredMedicines().filter(
      medicine => this.getStatus(medicine) === 'Expired'
    ).length
  );

  readonly lowStockCount = computed(() =>
    this.filteredMedicines().filter(
      medicine => this.getStatus(medicine) === 'LowStock'
    ).length
  );

  readonly inStockCount = computed(() =>
    this.filteredMedicines().filter(
      medicine => this.getStatus(medicine) === 'InStock'
    ).length
  );

  readonly outOfStockCount = computed(() =>
    this.filteredMedicines().filter(
      medicine => this.getStatus(medicine) === 'OutOfStock'
    ).length
  );
}

