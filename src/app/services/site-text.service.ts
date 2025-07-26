import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface SiteText {
  headerText: string;
  footerText: string;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SiteTextService {
  private firestore = inject(Firestore);
  private siteTextSubject = new BehaviorSubject<SiteText>({
    headerText: 'Main Title',
    footerText: 'Footer Title',
    lastUpdated: new Date()
  });

  public siteText$ = this.siteTextSubject.asObservable();

  constructor() {
    this.loadSiteText();
  }

  // Load site text from Firestore and set up real-time listener
  private loadSiteText() {
    const docRef = doc(this.firestore, 'site-config', 'text-settings');
    
    // Set up real-time listener
    onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as SiteText;
        this.siteTextSubject.next(data);
      }
    });
  }

  // Get current site text (synchronous)
  getCurrentSiteText(): SiteText {
    return this.siteTextSubject.value;
  }
}
