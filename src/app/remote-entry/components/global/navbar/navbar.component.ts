import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

interface User {
  name: string;
  email: string;
  picture?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  query: string = '';
  user: any | null = JSON.parse(sessionStorage.getItem('user') || 'null');
  handleSubmit(event: Event) {
    event.preventDefault();
    this.goToRoute();
  }
  goToRoute() {
    if (this.query.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.query } });
    } else {
      this.router.navigate(['/home']);
    }
  }
  handleLogOut() {
    this.authService.signOut();
    sessionStorage.removeItem('user');
  }
  handleLogin() {
    this.router.navigate(['login']);
  }
}
