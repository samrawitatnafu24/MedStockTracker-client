import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="dashboard-page">

      <!-- HEADER -->
      <div class="dashboard-header">
        <div>
          <span class="eyebrow">Inventory management</span>
          <h1>Overview</h1>
          <p>Sales, stock & real-time inventory performance</p>
        </div>

        <a
          routerLink="/medicines"
          mat-flat-button
          color="primary"
        >
          View Medicines
        </a>
      </div>

      <!-- SUMMARY CARDS -->
      <section class="summary-grid">

        <mat-card class="summary-card">
          <div class="card-icon">
            <mat-icon>payments</mat-icon>
          </div>

          <div>
            <span>Revenue (7d)</span>
            <strong>ETB 40,300.00</strong>
            <small>? 12.4% vs last week</small>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-icon">
            <mat-icon>inventory_2</mat-icon>
          </div>

          <div>
            <span>Inventory Value</span>
            <strong>ETB 184,230.00</strong>
            <small>? 2.8% vs last week</small>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-icon">
            <mat-icon>shopping_cart</mat-icon>
          </div>

          <div>
            <span>Orders (7d)</span>
            <strong>339</strong>
            <small>? 6.1% vs last week</small>
          </div>
        </mat-card>

        <mat-card class="summary-card warning-card">
          <div class="card-icon">
            <mat-icon>warning</mat-icon>
          </div>

          <div>
            <span>Low Stock SKUs</span>
            <strong>{{ lowStockCount }}</strong>
            <small>Need monitor</small>
          </div>
        </mat-card>

      </section>

      <!-- ANALYTICS -->
      <section class="analytics-grid">

        <!-- LINE CHART -->
        <mat-card class="chart-card">

          <div class="panel-header">
            <div>
              <span class="eyebrow">Sales Trend</span>
              <h2>Weekly movement</h2>
            </div>

            <span class="trend-badge">
              +12.4%
            </span>
          </div>

          <div class="chart-wrapper">

            <svg
              viewBox="0 0 700 280"
              preserveAspectRatio="none"
              class="line-chart"
            >

              <!-- GRID -->
              <line
                x1="45"
                y1="35"
                x2="675"
                y2="35"
                class="grid-line"
              />

              <line
                x1="45"
                y1="95"
                x2="675"
                y2="95"
                class="grid-line"
              />

              <line
                x1="45"
                y1="155"
                x2="675"
                y2="155"
                class="grid-line"
              />

              <line
                x1="45"
                y1="215"
                x2="675"
                y2="215"
                class="grid-line"
              />

              <!-- AREA -->
              <path
                d="M55 205
                   L155 160
                   L255 180
                   L355 105
                   L455 45
                   L555 82
                   L655 150
                   L655 235
                   L55 235 Z"
                class="chart-area"
              />

              <!-- LINE -->
              <polyline
                points="55,205 155,160 255,180 355,105 455,45 555,82 655,150"
                class="chart-line"
              />

              <!-- POINTS -->
              @for (point of chartPoints; track point.day) {
                <circle
                  [attr.cx]="point.x"
                  [attr.cy]="point.y"
                  r="6"
                  class="chart-point"
                />

                <circle
                  [attr.cx]="point.x"
                  [attr.cy]="point.y"
                  r="11"
                  class="chart-point-ring"
                />
              }

            </svg>

            <!-- DAYS -->
            <div class="chart-days">
              @for (point of chartPoints; track point.day) {
                <span>{{ point.day }}</span>
              }
            </div>

          </div>

        </mat-card>

        <!-- STOCK HEALTH -->
        <mat-card class="health-card">

          <div class="panel-header">
            <div>
              <span class="eyebrow">Stock Health</span>
              <h2>Branch inventory</h2>
            </div>

            <mat-icon>monitor_heart</mat-icon>
          </div>

          <div class="health-list">

            <div class="health-item">
              <div class="health-title">
                <span>4 Kilo Hospital</span>
                <strong>1,840 / 2,400</strong>
              </div>

              <div class="health-track">
                <span style="width: 82%"></span>
              </div>
            </div>

            <div class="health-item">
              <div class="health-title">
                <span>Minilik Hospital</span>
                <strong>620 / 2,000</strong>
              </div>

              <div class="health-track">
                <span style="width: 64%"></span>
              </div>
            </div>

            <div class="health-item">
              <div class="health-title">
                <span>St. Peter Hospital</span>
                <strong>340 / 1,200</strong>
              </div>

              <div class="health-track danger">
                <span style="width: 38%"></span>
              </div>
            </div>

            <div class="health-item">
              <div class="health-title">
                <span>Central Store</span>
                <strong>1,120 / 1,600</strong>
              </div>

              <div class="health-track">
                <span style="width: 76%"></span>
              </div>
            </div>

          </div>

        </mat-card>

      </section>

      <!-- MEDICINES TABLE -->
      <mat-card class="medicine-card">

        <div class="table-header">
          <div>
            <span class="eyebrow">Live Inventory</span>
            <h2>Medicines</h2>
            <p>Current medicine inventory</p>
          </div>

          <a
            routerLink="/medicines"
            mat-stroked-button
            color="primary"
          >
            View all
          </a>
        </div>

        @if (isLoading) {
          <div class="message">
            Loading medicines...
          </div>
        }

        @if (errorMessage) {
          <div class="error-message">
            {{ errorMessage }}
          </div>
        }

        @if (!isLoading && medicines.length === 0) {
          <div class="message">
            No medicines found.
          </div>
        }

        @if (medicines.length > 0) {

          <div class="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Expiry</th>
                </tr>
              </thead>

              <tbody>

                @for (medicine of medicines; track medicine.id) {

                  <tr>

                    <td>
                      <strong>{{ medicine.name }}</strong>
                    </td>

                    <td>
                      {{ medicine.batchNumber }}
                    </td>

                    <td>
                      {{ medicine.quantity }}
                    </td>

                    <td>

                      <span
                        class="status"
                        [class.status-in]="medicine.status === 'InStock'"
                        [class.status-low]="medicine.status === 'LowStock'"
                        [class.status-out]="medicine.status === 'OutOfStock'"
                      >
                        {{ medicine.status }}
                      </span>

                    </td>

                    <td>
                      {{ medicine.expiryDate | date:'mediumDate' }}
                    </td>

                  </tr>

                }

              </tbody>

            </table>

          </div>

        }

      </mat-card>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .dashboard-page {
      min-height: 100vh;
      padding: 28px;
      background: #f6f8f8;
      color: #17201f;
      box-sizing: border-box;
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      margin: 4px 0;
      font-size: 28px;
      font-weight: 700;
    }

    .dashboard-header p {
      margin: 0;
      color: #73817f;
    }

    .eyebrow {
      display: block;
      color: #6f7d7a;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      font-weight: 600;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 18px;
    }

    .summary-card {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 20px;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(30, 60, 55, .06);
    }

    .card-icon {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: #e8f6f2;
      color: #008f75;
    }

    .summary-card span {
      display: block;
      color: #778481;
      font-size: 13px;
    }

    .summary-card strong {
      display: block;
      margin-top: 5px;
      font-size: 21px;
    }

    .summary-card small {
      display: block;
      margin-top: 5px;
      color: #0c977c;
      font-size: 11px;
    }

    .warning-card .card-icon {
      background: #fff2dc;
      color: #d48a20;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 1.55fr 1fr;
      gap: 18px;
      margin-bottom: 18px;
    }

    .chart-card,
    .health-card,
    .medicine-card {
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(30, 60, 55, .06);
      overflow: hidden;
    }

    .chart-card,
    .health-card {
      padding: 22px;
    }

    .panel-header,
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-header h2,
    .table-header h2 {
      margin: 4px 0;
      font-size: 18px;
    }

    .trend-badge {
      padding: 5px 9px;
      border-radius: 7px;
      background: #e8f6f2;
      color: #008f75;
      font-size: 12px;
      font-weight: 600;
    }

    .chart-wrapper {
      margin-top: 20px;
    }

    .line-chart {
      width: 100%;
      height: 250px;
      overflow: visible;
    }

    .grid-line {
      stroke: #e6eceb;
      stroke-width: 1;
      stroke-dasharray: 4 4;
    }

    .chart-area {
      fill: rgba(0, 143, 117, .10);
    }

    .chart-line {
      fill: none;
      stroke: #008f75;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .chart-point {
      fill: #008f75;
      stroke: white;
      stroke-width: 3;
    }

    .chart-point-ring {
      fill: none;
      stroke: rgba(0, 143, 117, .18);
      stroke-width: 2;
    }

    .chart-days {
      display: flex;
      justify-content: space-between;
      padding: 0 5%;
      color: #899491;
      font-size: 12px;
    }

    .health-list {
      margin-top: 24px;
    }

    .health-item {
      margin-bottom: 21px;
    }

    .health-title {
      display: flex;
      justify-content: space-between;
      margin-bottom: 7px;
      font-size: 13px;
    }

    .health-title strong {
      color: #66736f;
      font-size: 12px;
    }

    .health-track {
      height: 8px;
      border-radius: 20px;
      background: #e8eeec;
      overflow: hidden;
    }

    .health-track span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: #168b78;
    }

    .health-track.danger span {
      background: #d76d4c;
    }

    .medicine-card {
      padding: 22px;
    }

    .table-header {
      margin-bottom: 18px;
    }

    .table-header p {
      margin: 3px 0 0;
      color: #7a8784;
      font-size: 13px;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f5f8f7;
      text-align: left;
      padding: 13px 16px;
      color: #596663;
      font-size: 12px;
    }

    td {
      padding: 15px 16px;
      border-bottom: 1px solid #edf1f0;
      font-size: 13px;
    }

    tr:hover {
      background: #fafcfc;
    }

    .status {
      display: inline-block;
      padding: 5px 9px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    .status-in {
      color: #087d69;
      background: #e5f7f1;
    }

    .status-low {
      color: #c27a18;
      background: #fff2dc;
    }

    .status-out {
      color: #bd3c3c;
      background: #fde8e8;
    }

    .message {
      padding: 30px;
      text-align: center;
      color: #75827f;
    }

    .error-message {
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 8px;
      background: #fdecec;
      color: #b42323;
    }

    @media (max-width: 1100px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 650px) {
      .dashboard-page {
        padding: 15px;
      }

      .dashboard-header {
        align-items: flex-start;
        gap: 15px;
        flex-direction: column;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {

  private medicineService = inject(MedicineService);

  medicines: Medicine[] = [];

  isLoading = false;
  errorMessage = '';

  chartPoints = [
    { day: 'Mon', amount: 4200, x: 55, y: 205 },
    { day: 'Tue', amount: 6100, x: 155, y: 160 },
    { day: 'Wed', amount: 5200, x: 255, y: 180 },
    { day: 'Thu', amount: 8200, x: 355, y: 105 },
    { day: 'Fri', amount: 10300, x: 455, y: 45 },
    { day: 'Sat', amount: 9100, x: 555, y: 82 },
    { day: 'Sun', amount: 6800, x: 655, y: 150 }
  ];

  get inStockCount(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'InStock'
    ).length;
  }

  get lowStockCount(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'LowStock'
    ).length;
  }

  get outOfStockCount(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'OutOfStock'
    ).length;
  }

  ngOnInit(): void {
    this.loadMedicines();
  }

  private loadMedicines(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        this.medicines = medicines?.items ?? [];
       this.isLoading = false;
      },

      error: (error) => {
        console.error('Failed to load medicines:', error);

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          'Failed to load medicines.';
      }
    });
  }
}
