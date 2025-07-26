import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { CategoryNavbar } from './layout/category-navbar/category-navbar';
import { Footer } from './layout/footer/footer';
import { SiteThemeService } from './services/site-theme.service';

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
  private siteThemeService = inject(SiteThemeService); // Initialize theme service
}
