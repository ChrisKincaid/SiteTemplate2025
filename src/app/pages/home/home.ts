import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCard } from '../../layout/post-card/post-card';
import { Posts } from '../../services/posts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  postsArray: any[] = [];
  featuredPosts: any[] = [];
  latestPosts: any[] = [];
  private subscription?: Subscription;

  constructor(private postService: Posts, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.postService.loadData().subscribe({
      next: (val: any) => {
        console.log('Posts loaded:', val);
        this.postsArray = val;
        
        // Filter featured posts
        this.featuredPosts = val.filter((post: any) => post.data.isFeatured === true);
        
        // Get latest posts (ALL posts, sorted by creation date - newest first)
        this.latestPosts = val
          .sort((a: any, b: any) => b.data.createdAt.seconds - a.data.createdAt.seconds);
        
        // Manually trigger change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

}
