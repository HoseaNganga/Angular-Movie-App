import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../global/navbar/navbar.component';
import { SidebarComponent } from '../global/sidebar/sidebar.component';
import { FooterComponent } from '../global/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let router: Router;
  let mockNgxSpinnerService: jest.Mocked<NgxSpinnerService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();

    mockNgxSpinnerService = {
      show: jest.fn(),
      hide: jest.fn(),
      getSpinner: jest.fn().mockReturnValue(of({})),
    } as any;

    mockAuthService = {
      signOut: jest.fn(),
    } as any;

    const mockSessionStorage = {
      getItem: jest.fn().mockReturnValue('null'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });

    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [
        LayoutComponent,
        NavbarComponent, // Explicitly import NavbarComponent
        SidebarComponent, // Import if needed
        FooterComponent, // Import if needed
        NoopAnimationsModule,
        RouterTestingModule,
        NgxSpinnerModule,
        FormsModule, // Required for NavbarComponent
        CommonModule, // Required for NavbarComponent
      ],
      providers: [
        { provide: NgxSpinnerService, useValue: mockNgxSpinnerService },
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Keep for other unknown elements if needed
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    Object.defineProperty(router, 'events', {
      value: routerEventsSubject.asObservable(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    routerEventsSubject.complete();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should show spinner on initialization', () => {
      component.ngOnInit();
      expect(mockNgxSpinnerService.show).toHaveBeenCalledTimes(1);
    });

    it('should hide spinner after 3 seconds', fakeAsync(() => {
      component.ngOnInit();
      expect(mockNgxSpinnerService.hide).not.toHaveBeenCalled();
      tick(3000);
      expect(mockNgxSpinnerService.hide).toHaveBeenCalledTimes(1);
    }));

    it('should subscribe to router events and filter NavigationEnd events', () => {
      const spy = jest.spyOn(window, 'scrollTo');
      component.ngOnInit();
      routerEventsSubject.next({ id: 1, url: '/test' });
      expect(spy).not.toHaveBeenCalled();
      const navigationEndEvent = new NavigationEnd(1, '/test', '/test');
      routerEventsSubject.next(navigationEndEvent);
      expect(spy).toHaveBeenCalledWith(0, 0);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should scroll to top on multiple NavigationEnd events', () => {
      const spy = jest.spyOn(window, 'scrollTo');
      component.ngOnInit();
      const navigationEndEvent1 = new NavigationEnd(1, '/home', '/home');
      const navigationEndEvent2 = new NavigationEnd(2, '/about', '/about');
      routerEventsSubject.next(navigationEndEvent1);
      routerEventsSubject.next(navigationEndEvent2);
      expect(spy).toHaveBeenCalledWith(0, 0);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed router events correctly', () => {
      const spy = jest.spyOn(window, 'scrollTo');
      component.ngOnInit();
      routerEventsSubject.next({ type: 'RouteConfigLoadStart' });
      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
      routerEventsSubject.next({ type: 'RouteConfigLoadEnd' });
      routerEventsSubject.next(new NavigationEnd(2, '/another', '/another'));
      expect(spy).toHaveBeenCalledWith(0, 0);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('component template and animations', () => {
    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should contain child component selectors in template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('app-sidebar')).toBeTruthy();
      expect(compiled.querySelector('app-navbar')).toBeTruthy();
      expect(compiled.querySelector('app-footer')).toBeTruthy();
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });
  });

  describe('service injection', () => {
    it('should inject NgxSpinnerService', () => {
      expect((component as any)._ngxSpinnerService).toBe(mockNgxSpinnerService);
    });

    it('should inject Router service', () => {
      expect((component as any)._routerService).toBe(router);
    });
  });

  describe('integration tests', () => {
    it('should complete full initialization flow', fakeAsync(() => {
      const scrollSpy = jest.spyOn(window, 'scrollTo');
      component.ngOnInit();
      expect(mockNgxSpinnerService.show).toHaveBeenCalledTimes(1);
      const navigationEndEvent = new NavigationEnd(
        1,
        '/dashboard',
        '/dashboard'
      );
      routerEventsSubject.next(navigationEndEvent);
      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
      tick(3000);
      expect(mockNgxSpinnerService.hide).toHaveBeenCalledTimes(1);
    }));

    it('should handle component destruction gracefully', () => {
      component.ngOnInit();
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should show and hide spinner with correct timing', fakeAsync(() => {
      component.ngOnInit();
      expect(mockNgxSpinnerService.show).toHaveBeenCalledTimes(1);
      tick(1500);
      expect(mockNgxSpinnerService.hide).not.toHaveBeenCalled();
      tick(1500);
      expect(mockNgxSpinnerService.hide).toHaveBeenCalledTimes(1);
    }));

    it('should handle navigation events during spinner timeout', fakeAsync(() => {
      const scrollSpy = jest.spyOn(window, 'scrollTo');
      component.ngOnInit();
      tick(1000);
      const navigationEndEvent = new NavigationEnd(1, '/test', '/test');
      routerEventsSubject.next(navigationEndEvent);
      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
      expect(mockNgxSpinnerService.show).toHaveBeenCalledTimes(1);
      expect(mockNgxSpinnerService.hide).not.toHaveBeenCalled();
      tick(2000);
      expect(mockNgxSpinnerService.hide).toHaveBeenCalledTimes(1);
    }));
  });
});
