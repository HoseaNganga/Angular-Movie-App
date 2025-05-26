import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { remoteRoutes } from './entry.route';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    NgxSpinnerModule,
    RouterModule.forRoot(remoteRoutes, { onSameUrlNavigation: 'reload' }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RemoteEntryModule {}
