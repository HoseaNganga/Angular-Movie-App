import { DateFormatPipe } from './date.pipe';

describe('DatePipe', () => {
  it('create an instance', () => {
    const pipe = new DateFormatPipe();
    expect(pipe).toBeTruthy();
  });
});
