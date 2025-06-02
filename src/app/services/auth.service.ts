declare var google: any;
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  signOut() {
    google.accounts.id.disableAutoSelect();
    this.router.navigate(['home']);
    sessionStorage.removeItem('user');
    window.location.reload();
  }
}
