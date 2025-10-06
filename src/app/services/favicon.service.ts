import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FaviconService {
  private firestore = inject(Firestore);
  private document = inject(DOCUMENT);

  async loadAndUpdateFavicon(): Promise<void> {
    try {
      // Load active favicon from siteImages collection
      const { query, getDocs, collection, where, and } = await import('@angular/fire/firestore');
      const imagesRef = collection(this.firestore, 'siteImages');
      const activeQuery = query(imagesRef, where('type', '==', 'favicon'), where('isActive', '==', true));
      const faviconSnap = await getDocs(activeQuery);
      
      if (!faviconSnap.empty) {
        const faviconDoc = faviconSnap.docs[0];
        const faviconData = faviconDoc.data();
        const files = faviconData['generatedFiles'] || null;
        
        // Update all favicon links in the document head
        this.updateFaviconLinks(files);
      } else {
        console.log('No active favicon found in siteImages collection');
      }
    } catch (error) {
      console.error('Error loading favicon configuration:', error);
    }
  }

  private updateFaviconLinks(files?: any): void {
    const head = this.document.head;
    
    // Remove existing favicon links
    const existingFavicons = head.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => link.remove());

    // If we have file URLs from Firestore, use those; otherwise use default paths
    let faviconLinks;
    if (files) {
      faviconLinks = [
        { rel: 'icon', type: 'image/x-icon', href: files['favicon.ico'] },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: files['favicon-16x16.png'] },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: files['favicon-32x32.png'] },
        { rel: 'apple-touch-icon', sizes: '180x180', href: files['apple-touch-icon.png'] },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: files['android-chrome-192x192.png'] },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: files['android-chrome-512x512.png'] }
      ];
    } else {
      // No custom favicon files available
      console.log('No favicon files available, using browser defaults');
      return;
    }

    faviconLinks.forEach(linkConfig => {
      if (linkConfig.href) {
        const link = this.document.createElement('link');
        link.rel = linkConfig.rel;
        link.type = linkConfig.type || '';
        if (linkConfig.sizes) link.sizes = linkConfig.sizes;
        link.href = linkConfig.href;
        head.appendChild(link);
      }
    });

    console.log('Favicon updated successfully');
  }

  // Method to manually refresh favicon (can be called when needed)
  async refreshFavicon(): Promise<void> {
    await this.loadAndUpdateFavicon();
  }
}