import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAuthComponent } from '../../components/user-auth/user-auth.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, UserAuthComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
}
