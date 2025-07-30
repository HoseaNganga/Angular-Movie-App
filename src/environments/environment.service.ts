import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private config: any;

  private readonly http = inject(HttpClient);

  loadEnv(): Promise<void> {
    return this.http
      .get('https://appinitializer-production.up.railway.app/config')
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
