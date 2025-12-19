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
  protected fixTotal = 0;
  protected fixLogs: string[] = [];
  protected fixSummary = '';
  protected fixProgress = 0;
  protected isFixing = false;
  protected keyboardDemoActive = false;
  protected copyLabel = 'Copy';

  private fixTimeoutId: number | null = null;
  private keyboardIntervalId: number | null = null;
  private keyboardTimeoutId: number | null = null;
  private copyTimeoutId: number | null = null;

  private readonly prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly handleFixAppliedBound = (event: Event) =>
    this.handleFixApplied(event as CustomEvent);
  private readonly handleFixesDisabledBound = () => this.handleFixesDisabled();
  private readonly handleFixesEnabledBound = (event: Event) =>
    this.handleFixesEnabled(event as CustomEvent);

  ngOnInit(): void {
    const embedAvailable = Boolean(window?.AACAEmbedDemo);

    if (embedAvailable) {
      window.AACAEmbedDemo?.disable();
    }

    this.autofixEnabled = false;

    window.addEventListener('aaca-fix-applied', this.handleFixAppliedBound as EventListener);
    window.addEventListener('aaca-fixes-disabled', this.handleFixesDisabledBound);
    window.addEventListener('aaca-fixes-enabled', this.handleFixesEnabledBound as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('aaca-fix-applied', this.handleFixAppliedBound as EventListener);
    window.removeEventListener('aaca-fixes-disabled', this.handleFixesDisabledBound);
    window.removeEventListener('aaca-fixes-enabled', this.handleFixesEnabledBound as EventListener);
    this.clearTimers();
  }

  protected toggleAutoFix(): void {
    if (!window?.AACAEmbedDemo) {
      this.autofixEnabled = false;
      return;
    }

    this.stopKeyboardDemo();

    if (this.autofixEnabled) {
      window.AACAEmbedDemo.disable();
    } else {
      this.resetFixState();
      window.AACAEmbedDemo.enable();
      this.triggerFixingAnimation();
    }

    this.autofixEnabled = !this.autofixEnabled;
    if (!this.autofixEnabled) {
      this.isFixing = false;
    }
  }

  protected handleToggleKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleAutoFix();
    }
  }

  protected copyCode(): void {
    const code = '<script src="https://cdn.aaca.ai/fix.js" data-key="your-key"></script>';
    const updateLabel = () => {
      this.copyLabel = 'Copied!';
      this.cdr.detectChanges();
      if (this.copyTimeoutId) {
        window.clearTimeout(this.copyTimeoutId);
      }
      this.copyTimeoutId = window.setTimeout(() => {
        this.copyLabel = 'Copy';
        this.cdr.detectChanges();
      }, 1800);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(updateLabel).catch(updateLabel);
    } else {
      updateLabel();
    }
  }

  protected startKeyboardDemo(): void {
    if (this.keyboardDemoActive) {
      return;
    }

    const container = document.getElementById('demo-site-container');
    if (!container) {
      return;
    }

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>('a, button, input, select, textarea'),
    ).filter((element) => !element.hasAttribute('disabled'));

    if (!focusables.length) {
      return;
    }

    const stepInterval = this.prefersReducedMotion ? 350 : 700;
    let index = 0;

    const focusNext = () => {
      focusables[index % focusables.length]?.focus();
      index += 1;
    };

    this.keyboardDemoActive = true;
    focusNext();

    this.keyboardIntervalId = window.setInterval(focusNext, stepInterval);
    this.keyboardTimeoutId = window.setTimeout(() => {
      this.stopKeyboardDemo();
      this.cdr.detectChanges();
    }, focusables.length * stepInterval + 200);
  }

  private stopKeyboardDemo(): void {
    if (!this.keyboardDemoActive) {
      return;
    }

    this.keyboardDemoActive = false;
    if (this.keyboardIntervalId) {
      window.clearInterval(this.keyboardIntervalId);
      this.keyboardIntervalId = null;
    }
    if (this.keyboardTimeoutId) {
      window.clearTimeout(this.keyboardTimeoutId);
      this.keyboardTimeoutId = null;
    }
  }

  private handleFixApplied(event: CustomEvent) {
    const detail = event.detail || {};
    this.ngZone.run(() => {
      this.fixCount += 1;
      let message = detail.message || 'Applied fix';
      if (detail.value) {
        const value = String(detail.value);
        const shortValue = value.length > 24 ? `${value.substring(0, 24)}...` : value;
        message += `: "${shortValue}"`;
      }
      this.fixLogs.unshift(message);
      if (this.fixLogs.length > 6) {
        this.fixLogs.pop();
      }
      this.updateFixProgress();
      this.cdr.detectChanges();
    });
  }

  private handleFixesEnabled(event: CustomEvent) {
    const detail = event.detail || {};
    this.ngZone.run(() => {
      this.fixTotal = Number(detail.total) || 0;
      this.updateFixProgress();
      if (this.fixTotal && this.fixCount >= this.fixTotal) {
        this.fixSummary = `${this.fixTotal} fixes applied in 0.3s`;
      }
      this.cdr.detectChanges();
    });
  }

  private handleFixesDisabled() {
    this.ngZone.run(() => {
      this.resetFixState();
      this.cdr.detectChanges();
    });
  }

  private resetFixState(): void {
    this.fixCount = 0;
    this.fixTotal = 0;
    this.fixLogs = [];
    this.fixSummary = '';
    this.fixProgress = 0;
  }

  private updateFixProgress(): void {
    if (this.fixTotal > 0) {
      this.fixProgress = Math.min((this.fixCount / this.fixTotal) * 100, 100);
    }
  }

  private triggerFixingAnimation(): void {
    if (this.prefersReducedMotion) {
      this.isFixing = false;
      return;
    }

    this.isFixing = true;
    if (this.fixTimeoutId) {
      window.clearTimeout(this.fixTimeoutId);
    }
    this.fixTimeoutId = window.setTimeout(() => {
      this.isFixing = false;
      this.cdr.detectChanges();
    }, 650);
  }

  private clearTimers(): void {
    if (this.fixTimeoutId) {
      window.clearTimeout(this.fixTimeoutId);
      this.fixTimeoutId = null;
    }
    if (this.keyboardIntervalId) {
      window.clearInterval(this.keyboardIntervalId);
      this.keyboardIntervalId = null;
    }
    if (this.keyboardTimeoutId) {
      window.clearTimeout(this.keyboardTimeoutId);
      this.keyboardTimeoutId = null;
    }
    if (this.copyTimeoutId) {
      window.clearTimeout(this.copyTimeoutId);
      this.copyTimeoutId = null;
    }
  }
}
