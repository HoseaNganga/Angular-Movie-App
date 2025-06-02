import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeUrlPipe } from './safe_url.pipe';

describe('SafeUrlPipe', () => {
  let pipe: SafeUrlPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SafeUrlPipe,
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: jest.fn(),
          },
        },
      ],
    });

    pipe = TestBed.inject(SafeUrlPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform URL using DomSanitizer', () => {
    const testUrl = 'https://example.com';
    const mockSafeUrl = {
      changingThisBreaksApplicationSecurity: testUrl,
    } as any;

    jest
      .spyOn(sanitizer, 'bypassSecurityTrustResourceUrl')
      .mockReturnValue(mockSafeUrl);

    const result = pipe.transform(testUrl);

    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
      testUrl
    );
    expect(result).toEqual(mockSafeUrl);
  });

  it('should handle empty string input', () => {
    const emptyUrl = '';
    const mockSafeUrl = {
      changingThisBreaksApplicationSecurity: emptyUrl,
    } as any;

    jest
      .spyOn(sanitizer, 'bypassSecurityTrustResourceUrl')
      .mockReturnValue(mockSafeUrl);

    const result = pipe.transform(emptyUrl);

    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
      emptyUrl
    );
    expect(result).toEqual(mockSafeUrl);
  });
});
