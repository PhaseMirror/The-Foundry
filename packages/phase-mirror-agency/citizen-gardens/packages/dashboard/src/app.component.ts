
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { CreditCardsComponent } from './components/credit-cards/credit-cards.component';
import { VisualizationComponent } from './components/visualization/visualization.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, HeroComponent, CreditCardsComponent, VisualizationComponent]
})
export class AppComponent {}
