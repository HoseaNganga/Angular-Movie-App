import { SafeUrlPipe } from './safe_url.pipe';

describe('TruncPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
