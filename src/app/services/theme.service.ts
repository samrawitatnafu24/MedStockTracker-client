import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(
    localStorage.getItem('medstock-theme') === 'dark'
  );

  constructor() {
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode.update(value => !value);
    this.applyTheme();
  }

  private applyTheme(): void {
    const dark = this.isDarkMode();

    document.documentElement.classList.toggle('dark', dark);

    localStorage.setItem(
      'medstock-theme',
      dark ? 'dark' : 'light'
    );
  }
}
