import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const detailMessage = err.error?.detail ?? 'A system error occurred.';
      if (err.status === 401) {
        router.navigate(['/auth']);
      }
      return throwError(() => new Error(detailMessage));
    })
  );
};
