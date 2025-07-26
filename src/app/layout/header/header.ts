import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteImagesService } from '../../services/site-images.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  activeHeaderImage: any = null;
  private headerImageSubscription?: Subscription;

  constructor(private siteImagesService: SiteImagesService) {}

  ngOnInit() {
    // Subscribe to header image changes
    this.headerImageSubscription = this.siteImagesService.headerImage$.subscribe(
      (image) => {
        this.activeHeaderImage = image;
        console.log('Header image updated:', image);
      }
    );
  }

  ngOnDestroy() {
    if (this.headerImageSubscription) {
      this.headerImageSubscription.unsubscribe();
    }
    
    // Clean up site images service
    this.siteImagesService.ngOnDestroy();
  }
}
