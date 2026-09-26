
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CreditCard, CREDIT_CARD_DATA } from '../../models/credit-card.model';
import { CreditCardComponent } from '../credit-card/credit-card.component';

@Component({
  selector: 'app-credit-cards',
  templateUrl: './credit-cards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CreditCardComponent]
})
export class CreditCardsComponent {
  creditCards = signal<CreditCard[]>(CREDIT_CARD_DATA);
}
