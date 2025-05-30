import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RemoteEntryComponent } from './remote-entry.component';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('RemoteEntryComponent', () => {
  let component: RemoteEntryComponent;
  let fixture: ComponentFixture<RemoteEntryComponent>;
  let spinnerServiceMock: jest.Mocked<NgxSpinnerService>;
  let routerMock: { events: Subject<any> };

  beforeEach(async () => {
    // Mocks
    spinnerServiceMock = {
      show: jest.fn(),
      hide: jest.fn(),
    } as unknown as jest.Mocked<NgxSpinnerService>;

    routerMock = {
      events: new Subject<any>(),
    };

    await TestBed.configureTestingModule({
      imports: [RemoteEntryComponent], // Standalone component import
      providers: [
        { provide: NgxSpinnerService, useValue: spinnerServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoteEntryComponent);
    component = fixture.componentInstance;

    // Mock scrollTo
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show and hide spinner on init', fakeAsync(() => {
    component.ngOnInit();
    expect(spinnerServiceMock.show).toHaveBeenCalled();

    tick(3000);
    expect(spinnerServiceMock.hide).toHaveBeenCalled();
  }));

  it('should scroll to top on NavigationEnd event', () => {
    component.ngOnInit();

    routerMock.events.next(new NavigationEnd(1, '/home', '/home'));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
  it('should render ngx-spinner', () => {
    const spinner = fixture.debugElement.query(By.css('ngx-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should render navbar component', () => {
    const navbar = fixture.debugElement.query(By.css('app-navbar'));
    expect(navbar).toBeTruthy();
  });

  it('should render sidebar component', () => {
    const sidebar = fixture.debugElement.query(By.css('app-sidebar'));
    expect(sidebar).toBeTruthy();
  });

  it('should render footer component', () => {
    const footer = fixture.debugElement.query(By.css('app-footer'));
    expect(footer).toBeTruthy();
  });
});
