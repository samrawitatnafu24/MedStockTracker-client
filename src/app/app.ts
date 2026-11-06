import { Component, signal, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    @if (isAuthPage()) {
      <main class="auth-page-host" dir="ltr">
        <router-outlet></router-outlet>
      </main>
    } @else {
      <mat-sidenav-container
        dir="ltr"
        class="material-shell"
        [class.dark]="isDarkMode()"
      >

        <mat-sidenav
          mode="side"
          opened
          position="start"
          class="material-sidenav"
        >

          <!-- Sidebar Branding -->
          <div
            class="flex h-16 items-center justify-between px-4
                   border-b border-slate-100 dark:border-slate-700/50"
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center
                       rounded-lg bg-emerald-600 text-white shadow-md"
              >
                <mat-icon>medication</mat-icon>
              </div>

              @if (isSidebarExpanded()) {
                <span
                  class="font-bold text-lg tracking-tight
                         bg-gradient-to-r from-emerald-600 to-teal-500
                         bg-clip-text text-transparent whitespace-nowrap"
                >
                  MedStock
                </span>
              }
            </div>

            <button
              mat-icon-button
              (click)="toggleSidebar()"
              matTooltip="Toggle sidebar"
            >
              <mat-icon>
                {{ isSidebarExpanded() ? 'chevron_left' : 'chevron_right' }}
              </mat-icon>
            </button>
          </div>

          <!-- Navigation -->
          <nav class="p-4 space-y-1">

            <a
              routerLink="/dashboard"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              class="flex items-center gap-4 px-3 py-2.5 rounded-lg
                     text-sm font-medium hover:bg-slate-50
                     dark:hover:bg-slate-700/50 text-slate-600
                     dark:text-slate-400 transition-all"
            >
              <mat-icon>dashboard</mat-icon>

              @if (isSidebarExpanded()) {
                <span class="whitespace-nowrap">Dashboard</span>
              }
            </a>

            <a
              routerLink="/admin-ledger"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              class="flex items-center gap-4 px-3 py-2.5 rounded-lg
                     text-sm font-medium hover:bg-slate-50
                     dark:hover:bg-slate-700/50 text-slate-600
                     dark:text-slate-400 transition-all"
            >
              <mat-icon>receipt_long</mat-icon>

              @if (isSidebarExpanded()) {
                <span class="whitespace-nowrap">Admin Ledger</span>
              }
            </a>

            <a
              routerLink="/medicines"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              class="flex items-center gap-4 px-3 py-2.5 rounded-lg
                     text-sm font-medium hover:bg-slate-50
                     dark:hover:bg-slate-700/50 text-slate-600
                     dark:text-slate-400 transition-all"
            >
              <mat-icon>medication</mat-icon>

              @if (isSidebarExpanded()) {
                <span class="whitespace-nowrap">Medicines</span>
              }
            </a>
            <a
              routerLink="/categories"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              class="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 transition-all"
            >
              <mat-icon>category</mat-icon>
              @if (isSidebarExpanded()) {
                <span class="whitespace-nowrap">Categories</span>
              }
            </a>

            <a
              routerLink="/purchases"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              class="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 transition-all"
            >
              <mat-icon>shopping_cart</mat-icon>
              @if (isSidebarExpanded()) {
                <span class="whitespace-nowrap">Purchases</span>
              }
            </a>

            <a
              routerLink="/suppliers"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              class="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 transition-all"
            >
              <mat-icon>local_shipping</mat-icon>
              @if (isSidebarExpanded()) {
                <span class="whitespace-nowrap">Suppliers</span>
              }
            </a>
            <a
              routerLink="/sales"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              class="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 transition-all"
            >
              <mat-icon>point_of_sale</mat-icon>
              @if (isSidebarExpanded()) {
                <span class="whitespace-nowrap">Sales</span>
              }
            </a>
            <a
              routerLink="/settings"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              class="flex items-center gap-4 px-3 py-2.5 rounded-lg
                     text-sm font-medium hover:bg-slate-50
                     dark:hover:bg-slate-700/50 text-slate-600
                     dark:text-slate-400 transition-all"
            >
              <span class="text-lg">⚙️</span>
              @if (isSidebarExpanded()) {
                <span class="whitespace-nowrap">Settings</span>
              }
            </a>
          </nav>

        </mat-sidenav>

        <mat-sidenav-content>

          <!-- Header -->
          <header
            class="h-16 border-b border-slate-200
                   dark:border-slate-800 bg-white
                   dark:bg-slate-800 flex items-center
                   justify-between px-8 sticky top-0 z-30"
          >

            <div>
              <h1
                class="text-xl font-semibold tracking-tight
                       text-slate-800 dark:text-white"
              >
                System Monitor
              </h1>
            </div>

            <div class="flex items-center gap-4">

              <!-- Theme Switcher -->
              <button
                mat-button
                (click)="toggleTheme()"
                class="p-2 rounded-lg border border-slate-200
                       dark:border-slate-700 hover:bg-slate-50
                       dark:hover:bg-slate-700/50 transition-all
                       text-slate-500 dark:text-slate-400"
              >
                {{ isDarkMode() ? 'Light Mode' : 'Dark Mode' }}
              </button>

              <!-- Admin Profile -->
              <div
                class="flex items-center gap-3 pl-3
                       border-l border-slate-200
                       dark:border-slate-700"
              >
                <div
                  class="h-9 w-9 rounded-full bg-slate-200
                         dark:bg-slate-700 flex items-center
                         justify-center font-bold text-sm
                         text-emerald-600 dark:text-emerald-400"
                >
                  SM
                </div>

                <span
                  class="text-sm font-medium hidden md:inline
                         text-slate-600 dark:text-slate-300"
                >
                  Samrawit Admin
                </span>
              </div>

            </div>
          </header>

          <!-- Routed Content -->
          <main class="p-8 max-w-[1600px] mx-auto">
            <router-outlet></router-outlet>
          </main>

        </mat-sidenav-content>

      </mat-sidenav-container>
    }
  `,
  styleUrls: ['./app.css']
})
export class AppComponent {
  isSidebarExpanded = signal<boolean>(true);
  private themeService = inject(ThemeService);
  isDarkMode = this.themeService.isDarkMode;
  isAuthPage = signal<boolean>(true);

  constructor(private router: Router) {
    this.isAuthPage.set(this.router.url.startsWith('/auth'));

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.isAuthPage.set(
          event.urlAfterRedirects.startsWith('/auth')
        );
      });
  }

  toggleSidebar(): void {
    this.isSidebarExpanded.update(value => !value);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
