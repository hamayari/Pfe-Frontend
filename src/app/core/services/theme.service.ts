import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light-theme' | 'dark-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private colorScheme: Theme = 'light-theme';
  private themeSubject = new BehaviorSubject<Theme>(this.colorScheme);
  
  // Define theme colors for programmatic use
  private readonly THEME_COLORS = {
    'light-theme': {
      '--primary-color': '#3f51b5',
      '--accent-color': '#ff4081',
      '--warn-color': '#f44336',
      '--background-color': '#f5f5f5',
      '--surface-color': '#ffffff',
      '--on-primary': '#ffffff',
      '--on-accent': '#ffffff',
      '--on-warn': '#ffffff',
      '--on-background': '#000000',
      '--on-surface': '#000000',
      '--text-primary': 'rgba(0, 0, 0, 0.87)',
      '--text-secondary': 'rgba(0, 0, 0, 0.6)',
      '--text-hint': 'rgba(0, 0, 0, 0.38)',
      '--divider': 'rgba(0, 0, 0, 0.12)',
      '--card-shadow': '0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)'
    },
    'dark-theme': {
      '--primary-color': '#5c6bc0',
      '--accent-color': '#ff80ab',
      '--warn-color': '#f44336',
      '--background-color': '#303030',
      '--surface-color': '#424242',
      '--on-primary': '#000000',
      '--on-accent': '#000000',
      '--on-warn': '#000000',
      '--on-background': '#ffffff',
      '--on-surface': '#ffffff',
      '--text-primary': 'rgba(255, 255, 255, 0.87)',
      '--text-secondary': 'rgba(255, 255, 255, 0.6)',
      '--text-hint': 'rgba(255, 255, 255, 0.38)',
      '--divider': 'rgba(255, 255, 255, 0.12)',
      '--card-shadow': '0 2px 1px -1px rgba(0,0,0,.4), 0 1px 1px 0 rgba(0,0,0,.28), 0 1px 3px 0 rgba(0,0,0,.24)'
    }
  };

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  /**
   * Initialize the theme based on user preference or system preference
   */
  private initializeTheme(): void {
    // Check for saved user preference, if any, on load
    const savedTheme = localStorage.getItem('user-theme') as Theme;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark-theme' : 'light-theme');
    }
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    this.setTheme(this.colorScheme === 'light-theme' ? 'dark-theme' : 'light-theme');
  }

  /**
   * Set the current theme
   * @param theme The theme to set ('light-theme' or 'dark-theme')
   */
  setTheme(theme: Theme): void {
    // Remove the old theme class and add the new one
    this.renderer.removeClass(document.body, this.colorScheme);
    this.renderer.addClass(document.body, theme);
    
    // Update the theme colors
    this.updateThemeVariables(theme);
    
    // Save the theme preference
    this.colorScheme = theme;
    localStorage.setItem('user-theme', theme);
    
    // Notify subscribers
    this.themeSubject.next(theme);
  }

  /**
   * Update CSS variables based on the current theme
   * @param theme The theme to apply
   */
  private updateThemeVariables(theme: Theme): void {
    const themeColors = this.THEME_COLORS[theme];
    
    // Set each CSS variable
    Object.entries(themeColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): Theme {
    return this.colorScheme;
  }

  /**
   * Get an observable of the current theme
   */
  getTheme(): Observable<Theme> {
    return this.themeSubject.asObservable();
  }

  /**
   * Check if the current theme is dark
   */
  isDarkTheme(): boolean {
    return this.colorScheme === 'dark-theme';
  }

  /**
   * Get a theme color by key
   * @param key The CSS variable name (e.g., '--primary-color')
   */
  getThemeColor(key: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim();
  }
}
