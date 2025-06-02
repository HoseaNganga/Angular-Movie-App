import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';

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

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: Router, useValue: routerMock }],
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

  it('should initialize Google Sign-In on init', () => {
    component.ngOnInit();

    expect(mockGoogleAccounts.initialize).toHaveBeenCalledWith({
      client_id:
        '1071675238042-5es3dutvpofqrstdfj7e3mf6f2je3nuk.apps.googleusercontent.com',
      callback: expect.any(Function),
    });
  });

  it('should render Google Sign-In button on init', () => {
    const mockElement = { id: 'google-btn' };
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    component.ngOnInit();

    expect(mockGoogleAccounts.renderButton).toHaveBeenCalledWith(mockElement, {
      theme: 'filled_blue',
      size: 'large',
      shape: 'rectangle',
      width: 250,
    });
  });

  it('should handle login callback correctly', () => {
    let capturedCallback: Function;
    mockGoogleAccounts.initialize.mockImplementation((config: any) => {
      capturedCallback = config.callback;
    });

    component.ngOnInit();

    capturedCallback(mockCredentialResponse);

    expect(router.navigate).toHaveBeenCalledWith(['home']);
    expect(sessionStorage.getItem('user')).toBe(
      JSON.stringify(mockTokenPayload)
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

  it('should remove no-padding class from body on destroy', () => {
    const removeSpy = jest.spyOn(document.body.classList, 'remove');

    component.ngOnDestroy();

    expect(removeSpy).toHaveBeenCalledWith('no-padding');
  });

  it('should handle token decoding with different payload', () => {
    const customPayload = {
      sub: '67890',
      name: 'Another User',
      email: 'another@test.com',
    };
    (global.atob as jest.Mock).mockReturnValueOnce(
      JSON.stringify(customPayload)
    );

    const token = 'header.customPayload.signature';
    const result = component['decodeToken'](token);

    expect(result).toEqual(customPayload);
  });

  it('should store user data in sessionStorage with correct format', () => {
    const setItemSpy = jest.spyOn(sessionStorage, 'setItem');

    component.handleLogin(mockCredentialResponse);

    const storedData = sessionStorage.getItem('user');
    expect(storedData).toBe(JSON.stringify(mockTokenPayload));
    expect(JSON.parse(storedData!)).toEqual(mockTokenPayload);
  });

  it('should handle missing google-btn element gracefully', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);

    expect(() => component.ngOnInit()).not.toThrow();
    expect(mockGoogleAccounts.renderButton).toHaveBeenCalledWith(
      null,
      expect.any(Object)
    );
  });

  it('should extract correct part of JWT token for decoding', () => {
    const testToken = 'part1.part2.part3';

    component['decodeToken'](testToken);

    expect(global.atob).toHaveBeenCalledWith('part2');
  });

  it('should integrate full login flow from initialization to navigation', () => {
    let capturedCallback: Function;
    mockGoogleAccounts.initialize.mockImplementation((config: any) => {
      capturedCallback = config.callback;
    });

    component.ngOnInit();

    expect(document.body.classList.contains('no-padding')).toBeTruthy();
    expect(mockGoogleAccounts.initialize).toHaveBeenCalled();
    expect(mockGoogleAccounts.renderButton).toHaveBeenCalled();

    capturedCallback(mockCredentialResponse);

    expect(sessionStorage.getItem('user')).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  });
});
