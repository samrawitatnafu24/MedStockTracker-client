import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-ledger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-ledger.component.html',
  styleUrls: ['./admin-ledger.component.css']
})
export class AdminLedgerComponent {
  ledgerEntries = [
    { id: 1, medicine: 'Amoxicillin 500mg', quantity: 45, status: 'Healthy', updatedBy: 'Dr. Selam' },
    { id: 2, medicine: 'Insulin Glargine', quantity: 120, status: 'Tracked', updatedBy: 'Pharmacist Aster' },
    { id: 3, medicine: 'Paracetamol 500mg', quantity: 0, status: 'Critical', updatedBy: 'Nurse Hana' }
  ];
}
