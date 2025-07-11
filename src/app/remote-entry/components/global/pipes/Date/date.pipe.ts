import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: any): string {
    if (value) {
      return new Date(value).toLocaleDateString();
    }
    return '';
  }
}
