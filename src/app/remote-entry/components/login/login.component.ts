declare var google: any;
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentService } from '../../../../environments/environment.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly _envService = inject(EnvironmentService);
  private readonly googleClientId = this._envService.get('googleClientId');
  ngOnInit(): void {
    document.body.classList.add('no-padding');
    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => {
        this.handleLogin(response);
      },
    });

    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'filled_blue',
      size: 'large',
      shape: 'rectangle',
      width: 250,
    });
  }
  private decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
  handleLogin(response: any) {
    if (response) {
      const responsePayload = this.decodeToken(response.credential);
      sessionStorage.setItem('user', JSON.stringify(responsePayload));
      this.router.navigate(['home']);
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-padding');
  }
}
