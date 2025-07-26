import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageContentService, PageContent } from '../../services/page-content.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css'
})
export class ContactUs implements OnInit, OnDestroy {
  private pageContentService = inject(PageContentService);
  
  content: string = '';
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.pageContentService.pageContent$.subscribe((pageContent: PageContent) => {
        this.content = pageContent.contactUs;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
