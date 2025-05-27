import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/global/navbar/navbar.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SidebarComponent } from './components/global/sidebar/sidebar.component';
import { FooterComponent } from './components/global/footer/footer.component';

@Component({
  selector: 'app-remote-entry',
  imports: [
    RouterModule,
    NavbarComponent,
    NgxSpinnerModule,
    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: './remote-entry.component.html',
  styleUrl: './remote-entry.component.scss',
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
export class RemoteEntryComponent implements OnInit {
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
    }, 5000);
  }
}
