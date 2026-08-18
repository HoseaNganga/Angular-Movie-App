import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  readonly backendUrl = environment.backendUrl;

  private config: any;

  private readonly http = inject(HttpClient);

  loadEnv(): Promise<void> {
    return this.http
      .get(`${this.backendUrl}/config`)
      .toPromise()
      .then((res) => {
        this.config = res;
      });
  }

  get env() {
    return this.config;
  }

  get(key: string): any {
    return this.config?.[key];
  }
}
