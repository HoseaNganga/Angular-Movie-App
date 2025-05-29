import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  query: string = '';
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
}
