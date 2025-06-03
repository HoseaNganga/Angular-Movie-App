import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { EnvironmentService } from '../../../../environments/environment.service';

// Mock Google API
declare var global: any;
global.google = {
  accounts: {
    id: {
      initialize: jest.fn(),
      renderButton: jest.fn(),
    },
  },
};

// Mock atob globally
global.atob = jest.fn();

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: jest.Mocked<Router>;
  let mockGoogleAccounts: any;
  let mockEnvService: Partial<EnvironmentService>;

  const mockTokenPayload = {
    sub: '12345',
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/picture.jpg',
  };

  const mockCredentialResponse = {
    credential:
      'header.eyJzdWIiOiIxMjM0NSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.signature',
  };

  beforeEach(async () => {
    const routerMock = {
      navigate: jest.fn(),
    };

    mockGoogleAccounts = {
      initialize: jest.fn(),
      renderButton: jest.fn(),
    };

    (global as any).google = {
      accounts: {
        id: mockGoogleAccounts,
      },
    };

    Object.defineProperty(document, 'getElementById', {
      value: jest.fn(() => ({ id: 'google-btn' })),
      writable: true,
    });

    (global.atob as jest.Mock).mockImplementation((str: string) => {
      return JSON.stringify(mockTokenPayload);
    });

    mockEnvService = {
      get: jest.fn(() => 'mock-google-client-id'),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: EnvironmentService, useValue: mockEnvService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    document.body.classList.remove('no-padding');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add no-padding class to body on init', () => {
    const addSpy = jest.spyOn(document.body.classList, 'add');
    component.ngOnInit();
    expect(addSpy).toHaveBeenCalledWith('no-padding');
  });

  it('should initialize Google Sign-In with client ID from env service', () => {
    component.ngOnInit();
    expect(mockEnvService.get).toHaveBeenCalledWith('googleClientId');
    expect(mockGoogleAccounts.initialize).toHaveBeenCalledWith({
      client_id: 'mock-google-client-id',
      callback: expect.any(Function),
    });
  });

  it('should render Google Sign-In button on init', () => {
    const mockElement = { id: 'google-btn' };
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
    component.ngOnInit();
    expect(mockGoogleAccounts.renderButton).toHaveBeenCalledWith(
      mockElement,
      expect.any(Object)
    );
  });

  it('should decode token correctly', () => {
    const token =
      'header.eyJzdWIiOiIxMjM0NSIsIm5hbWUiOiJUZXN0IFVzZXIifQ.signature';
    const result = component['decodeToken'](token);
    expect(global.atob).toHaveBeenCalledWith(
      'eyJzdWIiOiIxMjM0NSIsIm5hbWUiOiJUZXN0IFVzZXIifQ'
    );
    expect(result).toEqual(mockTokenPayload);
  });

  it('should store user data and navigate on login', () => {
    component.handleLogin(mockCredentialResponse);
    expect(sessionStorage.getItem('user')).toBe(
      JSON.stringify(mockTokenPayload)
    );
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  });

  it('should remove no-padding class from body on destroy', () => {
    const removeSpy = jest.spyOn(document.body.classList, 'remove');
    component.ngOnDestroy();
    expect(removeSpy).toHaveBeenCalledWith('no-padding');
  });
});
