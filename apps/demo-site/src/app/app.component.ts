import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptToggleComponent } from './components/script-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ScriptToggleComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AACA Embed Script Demo';
}
