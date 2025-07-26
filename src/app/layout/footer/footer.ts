import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteImagesService } from '../../services/site-images.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit, OnDestroy {
  activeFooterImage: any = null;
  private footerImageSubscription?: Subscription;

  constructor(private siteImagesService: SiteImagesService) {}

  ngOnInit() {
    // Subscribe to footer image changes
    this.footerImageSubscription = this.siteImagesService.footerImage$.subscribe(
      (image) => {
        this.activeFooterImage = image;
        console.log('Footer image updated:', image);
      }
    );
  }

  ngOnDestroy() {
    if (this.footerImageSubscription) {
      this.footerImageSubscription.unsubscribe();
    }
  }
}
