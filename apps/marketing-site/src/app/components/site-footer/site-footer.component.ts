import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss'],
  imports: [RouterLink],
})
export class SiteFooterComponent {
  readonly year = new Date().getFullYear();
}
