import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CTAButtonComponent } from './cta-button/cta-button.component';

@NgModule({
  imports: [CommonModule, CTAButtonComponent],
  exports: [CTAButtonComponent],
})
export class UiModule {}
