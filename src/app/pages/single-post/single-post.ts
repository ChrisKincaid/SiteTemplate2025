import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostCard } from '../../layout/post-card/post-card';
import { CommentsSectionComponent } from '../../components/comments-section/comments-section.component';
import { Posts } from '../../services/posts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-post',
  imports: [CommonModule, PostCard, CommentsSectionComponent], 
  templateUrl: './single-post.html',
  styleUrl: './single-post.css'
})
export class SinglePost implements OnInit, OnDestroy {
  currentPost: any = null;
  featuredPosts: any[] = [];
  randomFeaturedPosts: any[] = [];
  private subscription?: Subscription;
  private routeSubscription?: Subscription;
  private viewedPosts: Set<string> = new Set(); // Track viewed posts to prevent multiple increments

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: Posts,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Listen to route parameter changes instead of using snapshot
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const postId = params.get('id');
      
      if (postId) {
        this.loadPostData(postId);
      }
    });
  }

  private loadPostData(postId: string) {
    this.subscription = this.postService.loadData().subscribe({
      next: (posts: any[]) => {
        // Find the current post by ID
        this.currentPost = posts.find(post => post.id === postId);
        
        // Increment view count for this post (only once per session)
        if (this.currentPost && !this.viewedPosts.has(this.currentPost.id)) {
          this.postService.incrementViews(this.currentPost.id);
          this.viewedPosts.add(this.currentPost.id);
        }
        
        // Get featured posts for sidebar
        this.featuredPosts = posts.filter(post => post.data.isFeatured === true);
        
        // Get 3 random featured posts for sidebar (excluding current post)
        const availableFeatured = this.featuredPosts.filter(post => post.id !== postId);
        this.randomFeaturedPosts = this.getRandomPosts(availableFeatured, 3);
        
        // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading post:', error);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private getRandomPosts(posts: any[], count: number): any[] {
    const shuffled = [...posts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  onSubcategoryClick(subcategory: string) {
    // Navigate to category page with subcategory parameter
    this.router.navigate(['/category', 'subcategory'], { queryParams: { name: subcategory } });
  }

  trackBySubcategory(index: number, item: string) {
    return item;
  }
}
