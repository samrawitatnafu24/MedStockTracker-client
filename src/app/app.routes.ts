import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { roleGuard } from './guards/role.guard';
import { map, catchError, of } from 'rxjs';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component')
        .then(m => m.AuthComponent)
  },

  {
    path: 'dashboard',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isLoggedIn()) {
          return true;
        }

        return authService.checkSession().pipe(
          map(user => {
            if (user) {
              return true;
            }

            void router.navigate(['/auth']);
            return false;
          }),
          catchError(() => {
            void router.navigate(['/auth']);
            return of(false);
          })
        );
      }
    ],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  {
    path: 'medicines',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isLoggedIn()) {
          return true;
        }

        void router.navigate(['/auth']);
        return false;
      }
    ],
    loadComponent: () =>
      import('./features/medicines/medicines.component')
        .then(m => m.MedicinesComponent)
  },


  {
    path: 'categories',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isLoggedIn()) {
          return true;
        }

        void router.navigate(['/auth']);
        return false;
      }
    ],
    loadComponent: () =>
      import('./features/categories/categories.component')
        .then(m => m.CategoriesComponent)
  },

  {
    path: 'purchases',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        if (authService.isLoggedIn()) return true;
        void router.navigate(['/auth']);
        return false;
      }
    ],
    loadComponent: () =>
      import('./features/purchases/purchases.component')
        .then(m => m.PurchasesComponent)
  },

  {
    path: 'sales',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        if (authService.isLoggedIn()) return true;
        void router.navigate(['/auth']);
        return false;
      }
    ],
    loadComponent: () =>
      import('./features/sales/sales.component')
        .then(m => m.SalesComponent)
  },
  {
    path: 'suppliers',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        if (authService.isLoggedIn()) return true;
        void router.navigate(['/auth']);
        return false;
      }
    ],
    loadComponent: () =>
      import('./features/suppliers/suppliers.component')
        .then(m => m.SuppliersComponent)
  },
  {
    path: 'settings',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isLoggedIn()) {
          return true;
        }

        void router.navigate(['/auth']);
        return false;
      }
    ],
    loadComponent: () =>
      import('./features/settings/settings.component')
        .then(m => m.SettingsComponent)
  },
  {
    path: 'admin-ledger',
    canActivate: [roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/admin/admin-ledger.component')
        .then(m => m.AdminLedgerComponent)
  },

  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'auth'
  }
];



