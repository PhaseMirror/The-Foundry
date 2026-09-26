
import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { SparklineComponent } from '../sparkline/sparkline.component';

import { CreditCard } from '../../models/credit-card.model';

@Component({
  selector: 'app-credit-card',
  templateUrl: './credit-card.component.html',
  encapsulation: ViewEncapsulation.None, // To allow innerHTML SVG styles
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SparklineComponent]
})
export class CreditCardComponent {
  card = input.required<CreditCard>();

  cardStyles = computed(() => {
    const currentCard = this.card();
    return {
      '--card-accent-color': currentCard.accentColor,
      '--card-glow-color': currentCard.glowColor,
    };
  });

  formattedBalance = computed(() => {
    const balance = this.card().balance;
    return balance?.toLocaleString('en-US') ?? '';
  });
}
