import { inject } from '@angular/core';
import { EnvironmentService } from '../environments/environment.service';

export function initializeApp() {
  const envService = inject(EnvironmentService);
  return () => envService.loadEnv();
}
