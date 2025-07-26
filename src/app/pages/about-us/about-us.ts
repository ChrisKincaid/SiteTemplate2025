import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageContentService, PageContent } from '../../services/page-content.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-about-us',
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css'
})
export class AboutUs implements OnInit, OnDestroy {
  private pageContentService = inject(PageContentService);
  
  content: string = '';
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.pageContentService.pageContent$.subscribe((pageContent: PageContent) => {
        this.content = pageContent.aboutUs;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
