import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage =
        'Please provide both username and password credentials.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginPayload = {
      Username: this.credentials.username,
      Password: this.credentials.password
    };

    this.authService.login(loginPayload).subscribe({
      next: (user: any) => {
        this.isLoading = false;

        if (user && user.role) {
          this.router.navigate(['/dashboard']).then(() => {
            console.log('Successfully routed to Dashboard!');
          });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.detail ||
          'Authentication failed. Please verify credentials.';
      }
    });
  }
}

