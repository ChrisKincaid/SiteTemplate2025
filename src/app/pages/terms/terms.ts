import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageContentService, PageContent } from '../../services/page-content.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-terms',
  imports: [CommonModule, RouterModule],
  templateUrl: './terms.html',
  styleUrl: './terms.css'
})
export class Terms implements OnInit, OnDestroy {
  private pageContentService = inject(PageContentService);
  
  content: string = '';
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.pageContentService.pageContent$.subscribe((pageContent: PageContent) => {
        this.content = pageContent.terms;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
