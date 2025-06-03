import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { EnvironmentService } from '../../../environments/environment.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const envService = inject(EnvironmentService);
  const token = envService.get('tmdbToken') || '';
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }
  return next(req);
};
