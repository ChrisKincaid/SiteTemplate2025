import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { CategoryNavbar } from './layout/category-navbar/category-navbar';
import { Footer } from './layout/footer/footer';
import { FloatingAudioPlayerComponent } from './components/floating-audio-player/floating-audio-player.component';
import { SiteThemeService } from './services/site-theme.service';
import { FaviconService } from './services/favicon.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    Header, 
    CategoryNavbar, 
    Footer,
    FloatingAudioPlayerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('SiteTemplate2025');
  private siteThemeService = inject(SiteThemeService); // Initialize theme service
  private faviconService = inject(FaviconService); // Initialize favicon service

  async ngOnInit() {
    // Load and update favicon on app initialization
    await this.faviconService.loadAndUpdateFavicon();
  }
}
