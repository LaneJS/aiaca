import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ui-cta-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cta-button.component.html',
  styleUrls: ['./cta-button.component.scss'],
})
export class CTAButtonComponent {
  @Input() label = '';
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() href?: string;
  @Input() routerLink?: string | any[];
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() target?: string;
  @Input() disabled = false;
}
