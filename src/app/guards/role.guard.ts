import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Re-verify active session parameters
    if (!authService.isLoggedIn()) {
      void router.navigate(['/auth']);
      return false;
    }

    if (allowedRoles.some((role) => authService.hasRole(role))) {
      return true;
    }

    alert(
      'Access Denied: You do not carry the required clearance level for this sector.'
    );

    void router.navigate(['/dashboard']);
    return false;
  };
};