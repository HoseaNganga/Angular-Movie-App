import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageNamePipe } from '../pipes/LanguageName/language-name.pipe';
import { NumberWithCommasPipe } from '../pipes/NumberWithCommas/numberwithcommas.pipe';
import { TimePipe } from '../pipes/Time/time.pipe';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  imports: [
    CommonModule,
    RouterModule,
    LanguageNamePipe,
    NumberWithCommasPipe,
    TimePipe,
  ],
  styleUrl: './media.component.scss',
})
export class MediaComponent {
  @Input() data: any;
  @Input() externalData: any;
  @Input() type: 'movie' | 'tv' | 'person' = 'movie';
}
