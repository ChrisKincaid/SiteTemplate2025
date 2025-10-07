import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCard } from '../../layout/post-card/post-card';
import { Posts } from '../../services/posts';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

declare var $: any; // jQuery declaration for TypeScript

@Component({
  selector: 'app-home',
  imports: [CommonModule, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  // Make Math available in template
  Math = Math;
  
  postsArray: any[] = [];
  featuredPosts: any[] = [];
  latestPosts: any[] = [];
  
  // Pagination properties
  displayedPosts: any[] = [];
  currentPage: number = 1;
  postsPerPage: number = 24;
  loadMoreIncrement: number = 6;
  
  private subscription?: Subscription;

  constructor(private postService: Posts, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    this.subscription = this.postService.loadData().subscribe({
      next: (val: any) => {
        // Use setTimeout to avoid change detection issues
        setTimeout(() => {
          this.postsArray = val;
          
          // Filter featured posts
          this.featuredPosts = val.filter((post: any) => post.data.isFeatured === true);
          
          // Get latest posts (ALL posts, sorted by creation date - newest first)
          this.latestPosts = val
            .sort((a: any, b: any) => {
              // Handle different date formats
              let dateA, dateB;
              
              // Check if it's a Firestore Timestamp (has .seconds property)
              if (a.data.createdAt && a.data.createdAt.seconds) {
                dateA = new Date(a.data.createdAt.seconds * 1000);
              } else if (a.data.createdAt) {
                // Handle string dates or other formats
                dateA = new Date(a.data.createdAt);
              } else {
                // Fallback to other possible date fields
                dateA = new Date(a.data.dateCreated || a.data.publishedAt || a.data.timestamp || 0);
              }
              
              if (b.data.createdAt && b.data.createdAt.seconds) {
                dateB = new Date(b.data.createdAt.seconds * 1000);
              } else if (b.data.createdAt) {
                dateB = new Date(b.data.createdAt);
              } else {
                dateB = new Date(b.data.dateCreated || b.data.publishedAt || b.data.timestamp || 0);
              }
              
              return dateB.getTime() - dateA.getTime();
            });
          
          // Initialize displayed posts with first 24
          this.updateDisplayedPosts();
          
          this.cdr.detectChanges();
          
          // Reinitialize carousel after data is loaded
          setTimeout(() => {
            this.initializeCarousel();
          }, 100);
        }, 0);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  ngAfterViewInit() {
    // Initialize Bootstrap carousel with auto-rotation after a delay
    setTimeout(() => {
      this.initializeCarousel();
    }, 500);
  }

  private initializeCarousel() {
    if (typeof $ !== 'undefined' && this.featuredPosts.length > 0) {
      // Stop any existing carousel and remove all event handlers
      $('#featuredCarousel').off().removeData();
      
      // Force restart the carousel
      $('#featuredCarousel').carousel({
        interval: 6000, // Auto-rotate every 6 seconds
        pause: false, // Don't pause on hover - keep auto-rotating
        wrap: true, // Enable infinite loop
        keyboard: true, // Enable keyboard navigation
        touch: true // Enable touch/swipe
      });
      
      // Force start cycling
      $('#featuredCarousel').carousel('cycle');
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  onCarouselItemClick(post: any) {
    this.router.navigate(['/post', post.id]);
  }

  onImageError(event: any, post: any) {
    console.error('Image failed to load:', post.data.postImgPath, 'for post:', post.data.title);
  }

  onImageLoad(event: any, post: any) {
    // Image loaded successfully - no logging needed
  }

  // Pagination methods
  updateDisplayedPosts() {
    this.displayedPosts = this.latestPosts.slice(0, this.postsPerPage);
  }

  loadMorePosts() {
    const currentLength = this.displayedPosts.length;
    const newLength = Math.min(currentLength + this.loadMoreIncrement, this.latestPosts.length);
    this.displayedPosts = this.latestPosts.slice(0, newLength);
  }

  get hasMorePosts(): boolean {
    return this.displayedPosts.length < this.latestPosts.length;
  }

  get remainingPostsCount(): number {
    return this.latestPosts.length - this.displayedPosts.length;
  }

}
