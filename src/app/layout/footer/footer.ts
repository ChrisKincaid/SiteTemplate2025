import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteImagesService } from '../../services/site-images.service';
import { SiteTextService, SiteText } from '../../services/site-text.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit, OnDestroy {
  activeFooterImage: any = null;
  siteText: SiteText = { headerText: 'Main Title', footerText: 'Footer Title', lastUpdated: new Date() };
  
  private footerImageSubscription?: Subscription;
  private siteTextSubscription?: Subscription;
  private siteImagesService = inject(SiteImagesService);
  private siteTextService = inject(SiteTextService);

  ngOnInit() {
    // Subscribe to footer image changes
    this.footerImageSubscription = this.siteImagesService.footerImage$.subscribe(
      (image) => {
        this.activeFooterImage = image;
        console.log('Footer image updated:', image);
      }
    );

    // Subscribe to site text changes
    this.siteTextSubscription = this.siteTextService.siteText$.subscribe(
      (siteText) => {
        this.siteText = siteText;
      }
    );
  }

  ngOnDestroy() {
    if (this.footerImageSubscription) {
      this.footerImageSubscription.unsubscribe();
    }
    
    if (this.siteTextSubscription) {
      this.siteTextSubscription.unsubscribe();
    }
  }
}
