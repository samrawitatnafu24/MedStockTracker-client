import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white">
          Settings
        </h2>
        <p class="text-sm text-slate-500 mt-1">
          Manage your account and system preferences.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <aside class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <button (click)="activeTab.set('profile')"
            class="w-full text-left p-3 rounded-lg"
            [class.bg-emerald-50]="activeTab() === 'profile'"
            [class.text-emerald-700]="activeTab() === 'profile'">
            👤 Profile
          </button>

          <button (click)="activeTab.set('appearance')"
            class="w-full text-left p-3 rounded-lg"
            [class.bg-emerald-50]="activeTab() === 'appearance'"
            [class.text-emerald-700]="activeTab() === 'appearance'">
            🎨 Appearance
          </button>

          <button (click)="activeTab.set('security')"
            class="w-full text-left p-3 rounded-lg"
            [class.bg-emerald-50]="activeTab() === 'security'"
            [class.text-emerald-700]="activeTab() === 'security'">
            🔒 Security
          </button>

          <button (click)="activeTab.set('branch')"
            class="w-full text-left p-3 rounded-lg"
            [class.bg-emerald-50]="activeTab() === 'branch'"
            [class.text-emerald-700]="activeTab() === 'branch'">
            🏥 Branch Settings
          </button>
        </aside>

        <section class="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">

          @if (activeTab() === 'profile') {
            <h3 class="text-lg font-semibold mb-5">Admin Profile</h3>
            <div class="space-y-4 max-w-xl">
              <div>
                <label class="block text-sm mb-2">Display Name</label>
                <input value="Samrawit Admin" readonly
                  class="w-full rounded-lg border p-3 bg-slate-50 dark:bg-slate-700 dark:border-slate-600">
              </div>
              <div>
                <label class="block text-sm mb-2">Role</label>
                <input value="Admin" readonly
                  class="w-full rounded-lg border p-3 bg-slate-50 dark:bg-slate-700 dark:border-slate-600">
              </div>
              <p class="text-xs text-slate-500">
                Profile information is currently read-only.
              </p>
            </div>
          }

          @if (activeTab() === 'appearance') {
            <h3 class="text-lg font-semibold mb-5">Appearance</h3>
            <div class="flex items-center justify-between border rounded-lg p-4 dark:border-slate-600">
              <div>
                <p class="font-medium">Dark Mode</p>
                <p class="text-sm text-slate-500">Choose your preferred display theme.</p>
              </div>
              <button (click)="toggleDarkMode()"
                class="px-4 py-2 rounded-lg bg-emerald-600 text-white">
                {{ darkMode() ? 'Dark Mode On' : 'Dark Mode Off' }}
              </button>
            </div>
            <p class="text-xs text-slate-500 mt-3">
              Your theme preference applies across the application.
            </p>
          }

          @if (activeTab() === 'security') {
            <h3 class="text-lg font-semibold mb-5">Security</h3>
            <p class="text-slate-500">
              Password management settings will be connected to the authentication API.
            </p>
          }

          @if (activeTab() === 'branch') {
            <h3 class="text-lg font-semibold mb-5">Branch Settings</h3>
            <p class="text-slate-500">
              Manage your hospital branch information.
            </p>
            <div class="mt-4 rounded-lg bg-slate-50 dark:bg-slate-700 p-4">
              Current branch: <strong>4 Kilo</strong>
            </div>
          }

        </section>
      </div>
    </div>
  `
})
export class SettingsComponent {
  private themeService = inject(ThemeService);

  activeTab = signal('profile');
  darkMode = this.themeService.isDarkMode;

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }
}