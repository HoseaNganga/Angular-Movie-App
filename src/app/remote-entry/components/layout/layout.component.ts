import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../global/sidebar/sidebar.component';
import { NavbarComponent } from '../global/navbar/navbar.component';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../global/footer/footer.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [
    SidebarComponent,
    NavbarComponent,
    RouterModule,
    FooterComponent,
    NgxSpinnerModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class LayoutComponent implements OnInit {
  private readonly _ngxSpinnerService = inject(NgxSpinnerService);
  private readonly _routerService = inject(Router);

  ngOnInit(): void {
    this._routerService.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
    this._ngxSpinnerService.show();

    setTimeout(() => {
      this._ngxSpinnerService.hide();
    }, 3000);
  }
}
