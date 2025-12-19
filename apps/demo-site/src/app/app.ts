import { Component, OnInit, NgZone, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    AACAEmbedDemo?: {
      enable: () => void;
      disable: () => void;
    };
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  protected autofixEnabled = false;
  protected fixCount = 0;
  protected fixLogs: string[] = [];

  ngOnInit(): void {
    const embedAvailable = Boolean(window?.AACAEmbedDemo);

    if (embedAvailable) {
      window.AACAEmbedDemo?.disable();
    }

    this.autofixEnabled = false;

    window.addEventListener('aaca-fix-applied', this.handleFixApplied.bind(this) as EventListener);
    window.addEventListener('aaca-fixes-disabled', this.handleFixesDisabled.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('aaca-fix-applied', this.handleFixApplied.bind(this) as EventListener);
    window.removeEventListener('aaca-fixes-disabled', this.handleFixesDisabled.bind(this));
  }

  private handleFixApplied(event: Event) {
    const customEvent = event as CustomEvent;
    this.ngZone.run(() => {
        this.fixCount++;
        const detail = customEvent.detail;
        let message = detail.message;
        if (detail.value) {
            // Truncate value if too long
            const val = detail.value.length > 20 ? detail.value.substring(0, 20) + '...' : detail.value;
            message += `: "${val}"`;
        }
        this.fixLogs.unshift(message);
        if (this.fixLogs.length > 5) {
            this.fixLogs.pop();
        }
        this.cdr.detectChanges();
    });
  }

  private handleFixesDisabled() {
      this.ngZone.run(() => {
          this.fixCount = 0;
          this.fixLogs = [];
          this.cdr.detectChanges();
      });
  }


  protected toggleAutoFix(): void {
    if (!window?.AACAEmbedDemo) {
      this.autofixEnabled = false;
      return;
    }

    if (this.autofixEnabled) {
      window.AACAEmbedDemo.disable();
    } else {
      window.AACAEmbedDemo.enable();
    }

    this.autofixEnabled = !this.autofixEnabled;
  }

  protected copyCode(): void {
    const code = '<script src="https://cdn.aaca.ai/fix.js" data-key="your-key"></script>';
    navigator.clipboard.writeText(code).then(() => {
      alert('Snippet copied to clipboard!');
    });
  }
}
