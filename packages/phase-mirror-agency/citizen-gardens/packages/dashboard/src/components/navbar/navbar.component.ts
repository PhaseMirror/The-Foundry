
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage]
})
export class NavbarComponent {
  navItems = ['Dashboard', 'Credits', 'Governance', 'ELM Path', 'Community'];
  activeItem = signal('Dashboard');
  isMobileMenuOpen = signal(false);

  setActiveItem(item: string) {
    this.activeItem.set(item);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
  }
}
