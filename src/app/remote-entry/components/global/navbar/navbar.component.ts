import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  query: string = '';
  user: any | null = JSON.parse(sessionStorage.getItem('user') || 'null');

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null; // Initialize as null

  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(500))
      .subscribe((query) => {
        this.goToRoute(query);
      });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    this.goToRoute(this.query);
  }

  goToRoute(query: string) {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      this.router.navigate(['/search'], {
        queryParams: { query: trimmedQuery },
      });
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
