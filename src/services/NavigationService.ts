/**
 * NavigationService — imperative navigation for use outside React components.
 * Ported from squad-demo/src/services/NavigationService.ts.
 */
import type { NavigationContainerRef } from '@react-navigation/native';

class NavigationService {
  private navRef: NavigationContainerRef<any> | null = null;

  setNavigationRef(ref: NavigationContainerRef<any>): void {
    this.navRef = ref;
  }

  navigate(name: string, params?: Record<string, unknown>): void {
    if (!this.navRef?.isReady()) {
      console.warn('[NavigationService] Navigation not ready');
      return;
    }
    (this.navRef as any).navigate(name, params);
  }

  goBack(): void {
    if (this.navRef?.canGoBack()) {
      this.navRef.goBack();
    }
  }

  reset(routes: Array<{ name: string; params?: Record<string, unknown> }>): void {
    this.navRef?.reset({
      index: 0,
      routes: routes as any,
    });
  }

  getCurrentRoute(): string | undefined {
    return this.navRef?.getCurrentRoute()?.name;
  }
}

export const navigationService = new NavigationService();
