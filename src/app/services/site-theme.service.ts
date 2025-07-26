import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  bodyTextColor: string;
  navbarFooterColor: string;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SiteThemeService {
  private firestore = inject(Firestore);
  private siteThemeSubject = new BehaviorSubject<SiteTheme>({
    primaryColor: '#026467',
    secondaryColor: '#e5f5ea',
    bodyTextColor: '#596392',
    navbarFooterColor: '#f9f9f9',
    lastUpdated: new Date()
  });

  public siteTheme$ = this.siteThemeSubject.asObservable();

  constructor() {
    this.loadSiteTheme();
  }

  // Load site theme from Firestore and set up real-time listener
  private loadSiteTheme() {
    const docRef = doc(this.firestore, 'site-config', 'theme-settings');
    
    // Set up real-time listener
    onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as SiteTheme;
        this.siteThemeSubject.next(data);
        this.applyCSSVariables(data);
      }
    });
  }

  // Apply CSS variables to the document root
  private applyCSSVariables(theme: SiteTheme) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--body-text-color', theme.bodyTextColor);
    root.style.setProperty('--navbar-footer-color', theme.navbarFooterColor);
  }

  // Get current site theme (synchronous)
  getCurrentSiteTheme(): SiteTheme {
    return this.siteThemeSubject.value;
  }
}
