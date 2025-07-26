import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface PageContent {
  aboutUs: string;
  terms: string;
  contactUs: string;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PageContentService {
  private firestore = inject(Firestore);
  private pageContentSubject = new BehaviorSubject<PageContent>({
    aboutUs: '<p>We are a company dedicated to providing the best services to our customers.</p><p>Our team is composed of experienced professionals who are passionate about their work.</p><p>We believe in innovation, quality, and customer satisfaction.</p><p>Thank you for choosing us!</p>',
    terms: '<p>These are our terms and conditions.</p><p>By using our service, you agree to these terms.</p><p>Please read them carefully.</p>',
    contactUs: '<p>Contact us for any questions or support.</p><p>We are here to help you!</p><p>Email: support@example.com</p><p>Phone: (555) 123-4567</p>',
    lastUpdated: new Date()
  });

  public pageContent$ = this.pageContentSubject.asObservable();

  constructor() {
    this.loadPageContent();
  }

  // Load page content from Firestore and set up real-time listener
  private loadPageContent() {
    const docRef = doc(this.firestore, 'site-config', 'page-content');
    
    // Set up real-time listener
    onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as PageContent;
        this.pageContentSubject.next(data);
      }
    });
  }

  // Get current page content (synchronous)
  getCurrentPageContent(): PageContent {
    return this.pageContentSubject.value;
  }
}
