import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteImagesService } from '../../services/site-images.service';
import { SiteTextService, SiteText } from '../../services/site-text.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  activeHeaderImage: any = null;
  siteText: SiteText = { headerText: 'Main Title', footerText: 'Footer Title', lastUpdated: new Date() };
  
  private headerImageSubscription?: Subscription;
  private siteTextSubscription?: Subscription;
  private siteImagesService = inject(SiteImagesService);
  private siteTextService = inject(SiteTextService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Subscribe to header image changes
    this.headerImageSubscription = this.siteImagesService.headerImage$.subscribe(
      (image) => {
        this.activeHeaderImage = image;
        this.cdr.detectChanges(); // Manually trigger change detection
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
    if (this.headerImageSubscription) {
      this.headerImageSubscription.unsubscribe();
    }
    
    if (this.siteTextSubscription) {
      this.siteTextSubscription.unsubscribe();
    }
    
    // Clean up site images service
    this.siteImagesService.ngOnDestroy();
  }
}
