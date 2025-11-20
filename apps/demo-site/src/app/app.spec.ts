import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { App } from './app';

declare global {
  interface Window {
    AACAEmbedDemo?: {
      enable: () => void;
      disable: () => void;
    };
  }
}

describe('App', () => {
  afterEach(() => {
    delete window.AACAEmbedDemo;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterModule.forRoot([])],
    }).compileComponents();
  });

  it('should render the anti-pattern headline', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Accessibility Anti-Pattern Demo');
  });

  it('should toggle auto-fix state when the embed API exists', () => {
    const disable = jest.fn();
    const enable = jest.fn();
    window.AACAEmbedDemo = { disable, enable };
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    component.toggleAutoFix();
    expect(disable).toHaveBeenCalled();
    expect(component['autofixEnabled']).toBe(false);
  });
});
