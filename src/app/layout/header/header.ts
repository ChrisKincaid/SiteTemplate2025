import { Component } from '@angular/core';
import { SubscriptionForm } from '../../subscription-form/subscription-form';
import { UserAuthComponent } from '../../components/user-auth/user-auth.component';

@Component({
  selector: 'app-header',
  imports: [SubscriptionForm, UserAuthComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

}
