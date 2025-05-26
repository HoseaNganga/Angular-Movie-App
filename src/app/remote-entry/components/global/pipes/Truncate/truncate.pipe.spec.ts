import { TruncatePipe } from './truncate.pipe';

describe('TruncPipe', () => {
  it('create an instance', () => {
    const pipe = new TruncatePipe();
    expect(pipe).toBeTruthy();
  });
});
