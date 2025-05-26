import { NumberWithCommasPipe } from './numberwithcommas.pipe';

describe('TruncPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberWithCommasPipe();
    expect(pipe).toBeTruthy();
  });
});
