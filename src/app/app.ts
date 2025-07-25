import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { CategoryNavbar } from './layout/category-navbar/category-navbar';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    Header, 
    CategoryNavbar, 
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SiteTemplate2025');
}
