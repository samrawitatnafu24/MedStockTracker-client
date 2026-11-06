import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MedicineService } from '../../../services/medicine.service';
import { AuthService } from '../../../services/auth.service';
import { Medicine } from '../../../models/medicine.models';

@Component({
  selector: 'tms-stock-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-dashboard.component.html',
  styleUrls: ['./stock-dashboard.component.css']
})
export class StockDashboardComponent implements OnInit {
  public medicineService = inject(MedicineService);
  private authService = inject(AuthService);
  private router = inject(Router);

  medicinesList: Medicine[] = [];
  searchResults: any[] = [];
  isLoading = true;
  errorMessage = '';
  barcodeBuffer = '';
  isPublicRoute = false;

  editingMedicineId: number | null = null;

  ngOnInit(): void {
    this.isPublicRoute = this.router.url.includes('public-search');

    if (!this.isPublicRoute && !this.authService.isLoggedIn()) {
      this.authService.checkSession().subscribe({
        next: (user) => {
          if (!user) {
            void this.router.navigate(['/auth']);
          } else {
            this.loadMedicines();
          }
        },
        error: () => {
          void this.router.navigate(['/auth']);
        }
      });

      return;
    }

    this.loadMedicines();
  }

  loadMedicines(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.medicineService.getAll().subscribe({
  next: (data) => {
    this.medicinesList = data?.items ?? [];
    this.isLoading = false;
  },
      error: (err) => {
        console.error('Failed to load medicines:', err);

        this.isLoading = false;

        this.errorMessage =
          err?.error?.detail ||
          err?.error?.message ||
          err?.message ||
          'Failed to load medicines.';
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 0) {
        this.processHardwareBarcode(this.barcodeBuffer);
      }

      this.barcodeBuffer = '';
    } else if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
    }
  }

  processHardwareBarcode(barcode: string): void {
    if (barcode === '690123456789') {
      alert('Hardware Scan Verified: Auto-filled Augmentin 625mg!');
    }
  }

  onPublicSearch(medicineName: string): void {
    const cleanQuery = medicineName.trim().toLowerCase();

    if (!cleanQuery) {
      alert(
        'Please type a medication name to scan the hospital network registries.'
      );
      return;
    }

    const staticRegistry = [
      {
        MedicineName: 'Insulin Glargine',
        Pharmacy: 'Minilik Hospital Pharmacy',
        Quantity: 120,
        Price: 45.00,
        Location: '4 Kilo, Addis Ababa',
        Phone: '+251111XXXXXX'
      },
      {
        MedicineName: 'Insulin Glargine',
        Pharmacy: 'Anwar Pharmacy',
        Quantity: 15,
        Price: 48.50,
        Location: 'Merkato, near Anwar Mosque',
        Phone: '+251911XXXXXX'
      },
      {
        MedicineName: 'Amoxicillin 500mg',
        Pharmacy: 'Black Lion Hospital Pharmacy',
        Quantity: 0,
        Price: 15.50,
        Location: '6 Kilo, Addis Ababa',
        Phone: '+251111XXXXXX'
      }
    ];

    this.searchResults = staticRegistry.filter((item) =>
      item.MedicineName.toLowerCase().includes(cleanQuery)
    );
  }

  onAddMedicine(
    name: string,
    batch: string,
    qty: string,
    price: string,
    expiry: string
  ): void {
    if (!name || !batch || !qty) {
      alert('Please fill out the core fields!');
      return;
    }

    const calculatedQty = parseInt(qty, 10) || 0;

    const computedStatus: Medicine['status'] =
      calculatedQty === 0
        ? 'OutOfStock'
        : calculatedQty <= 5
          ? 'LowStock'
          : 'InStock';

    const medPayload = {
      name: name.trim(),
      sku: `SKU-${batch.toUpperCase()}`,
      batchNumber: batch.trim(),
      quantity: calculatedQty,
      minRequiredQuantity: 5,
      status: computedStatus,
      price: parseFloat(price) || 0,
      expiryDate: expiry || new Date().toISOString()
    };

    if (this.editingMedicineId !== null) {
      this.medicineService
        .update(this.editingMedicineId, medPayload)
        .subscribe({
          next: () => {
            this.editingMedicineId = null;
            this.loadMedicines();
            alert('Medicine updated successfully!');
          },
          error: (err) => {
            alert(
              'Failed to update: ' +
                (err?.error?.detail ||
                  err?.error?.message ||
                  err?.message ||
                  'Unknown error')
            );
          }
        });

      return;
    }

    this.medicineService.create(medPayload).subscribe({
      next: () => {
        this.loadMedicines();
        alert('Medicine added successfully!');
      },
      error: (err) => {
        alert(
          'Failed to save: ' +
            (err?.error?.detail ||
              err?.error?.message ||
              err?.message ||
              'Unknown error')
        );
      }
    });
  }

  onDeleteMedicine(id: number): void {
    if (!confirm('Are you sure you want to remove this medicine?')) {
      return;
    }

    this.medicineService.remove(id).subscribe({
      next: () => {
        this.medicinesList = this.medicinesList.filter(
          (medicine) => medicine.id !== id
        );
      },
      error: (err) => {
        alert(
          'Failed to delete: ' +
            (err?.error?.detail ||
              err?.error?.message ||
              err?.message ||
              'Unknown error')
        );
      }
    });
  }

  onEditMedicine(
    medicine: Medicine,
    nameInput: HTMLInputElement,
    batchInput: HTMLInputElement,
    qtyInput: HTMLInputElement,
    priceInput: HTMLInputElement,
    expiryInput: HTMLInputElement
  ): void {
    this.editingMedicineId = medicine.id;

    nameInput.value = medicine.name;
    batchInput.value = medicine.batchNumber;
    qtyInput.value = medicine.quantity.toString();
    priceInput.value = medicine.price?.toString() ?? '0';

    expiryInput.value = medicine.expiryDate
      ? medicine.expiryDate.split('T')[0]
      : '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    console.log('Selected file:', file.name);

    alert(`File selected: ${file.name}`);
  }
}
