import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { CategoryNavbar } from './layout/category-navbar/category-navbar';
import { Footer } from './layout/footer/footer';
import { PostCard } from './layout/post-card/post-card';
import { SubscriptionForm } from './subscription-form/subscription-form';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    Header, 
    CategoryNavbar, 
    Footer, 
    PostCard, 
    SubscriptionForm
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SiteTemplate2025');
}
