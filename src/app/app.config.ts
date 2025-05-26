import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { remoteRoutes } from './remote-entry/entry.route';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './remote-entry/Auth-Interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(remoteRoutes),
    provideAnimations(),
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
