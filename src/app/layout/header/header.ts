import { Component } from '@angular/core';
import { SubscriptionForm } from '../../subscription-form/subscription-form';

@Component({
  selector: 'app-header',
  imports: [SubscriptionForm],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

}
