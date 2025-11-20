import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-script-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toggle-control">
      <label>
        <input
          type="checkbox"
          [checked]="scriptEnabled()"
          (change)="toggle()"
        />
        <span class="toggle-label">
          Embed Script: {{ scriptEnabled() ? 'ON' : 'OFF' }}
        </span>
      </label>

      <div class="status-indicator" [class.active]="scriptEnabled()">
        {{ scriptEnabled() ? '✓ Fixes Active' : '✗ No Fixes' }}
      </div>
    </div>
  `
})
export class ScriptToggleComponent {
  scriptEnabled = signal(false);

  toggle(): void {
    const newState = !this.scriptEnabled();
    this.scriptEnabled.set(newState);

    if (newState) {
      this.injectScript();
    } else {
      this.removeScript();
    }
  }

  private injectScript(): void {
    const script = document.createElement('script');
    script.id = 'aaca-embed-script';
    script.src = environment.embedScriptUrl;
    script.setAttribute('data-site-id', environment.demoSiteId);
    script.setAttribute('data-embed-key', environment.demoEmbedKey);
    document.head.appendChild(script);

    console.log('AACA embed script injected:', {
      siteId: environment.demoSiteId,
      embedKey: environment.demoEmbedKey,
      scriptUrl: environment.embedScriptUrl
    });
  }

  private removeScript(): void {
    const script = document.getElementById('aaca-embed-script');
    if (script) {
      script.remove();
      console.log('AACA embed script removed - reloading page to reset fixes');
      window.location.reload();
    }
  }
}
