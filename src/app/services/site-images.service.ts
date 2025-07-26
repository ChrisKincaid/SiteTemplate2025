import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, onSnapshot, orderBy } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';

export interface SiteImage {
  id?: string;
  type: 'header' | 'footer';
  url: string;
  isActive: boolean;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class SiteImagesService {
  private headerImageSubject = new BehaviorSubject<SiteImage | null>(null);
  private footerImageSubject = new BehaviorSubject<SiteImage | null>(null);

  public headerImage$ = this.headerImageSubject.asObservable();
  public footerImage$ = this.footerImageSubject.asObservable();

  private headerUnsubscribe: (() => void) | null = null;
  private footerUnsubscribe: (() => void) | null = null;

  constructor(private firestore: Firestore) {
    this.initializeImageListeners();
  }

  private initializeImageListeners() {
    // Listen for active header images - simplified query to avoid index requirements
    const headerQuery = query(
      collection(this.firestore, 'siteImages'),
      where('type', '==', 'header'),
      where('isActive', '==', true)
    );

    this.headerUnsubscribe = onSnapshot(headerQuery, (snapshot) => {
      if (!snapshot.empty) {
        // Sort by createdAt in memory to avoid composite index requirement
        const images = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SiteImage));
        
        images.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return 0;
        });
        
        const imageData = images[0];
        this.headerImageSubject.next(imageData);
      } else {
        this.headerImageSubject.next(null);
      }
    }, (error) => {
      console.error('Error fetching header images:', error);
      this.headerImageSubject.next(null);
    });

    // Listen for active footer images - simplified query to avoid index requirements
    const footerQuery = query(
      collection(this.firestore, 'siteImages'),
      where('type', '==', 'footer'),
      where('isActive', '==', true)
    );

    this.footerUnsubscribe = onSnapshot(footerQuery, (snapshot) => {
      if (!snapshot.empty) {
        // Sort by createdAt in memory to avoid composite index requirement
        const images = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SiteImage));
        
        images.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return 0;
        });
        
        const imageData = images[0];
        this.footerImageSubject.next(imageData);
      } else {
        this.footerImageSubject.next(null);
      }
    }, (error) => {
      console.error('Error fetching footer images:', error);
      this.footerImageSubject.next(null);
    });
  }

  ngOnDestroy() {
    if (this.headerUnsubscribe) {
      this.headerUnsubscribe();
    }
    if (this.footerUnsubscribe) {
      this.footerUnsubscribe();
    }
  }

  // Get current active header image synchronously
  getCurrentHeaderImage(): SiteImage | null {
    return this.headerImageSubject.value;
  }

  // Get current active footer image synchronously
  getCurrentFooterImage(): SiteImage | null {
    return this.footerImageSubject.value;
  }
}
