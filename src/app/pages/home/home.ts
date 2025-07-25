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
  postsArray: any[] = [];
  featuredPosts: any[] = [];
  latestPosts: any[] = [];
  private subscription?: Subscription;

  constructor(private postService: Posts, private cdr: ChangeDetectorRef, private router: Router) { }

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
        
        console.log('Featured posts:', this.featuredPosts);
        
        // Use setTimeout to avoid change detection issues
        setTimeout(() => {
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
      
      console.log('Carousel initialized and cycling with', this.featuredPosts.length, 'featured posts');
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
    console.log('Full post data:', post);
  }

  onImageLoad(event: any, post: any) {
    console.log('Image loaded successfully:', post.data.postImgPath);
  }

}
