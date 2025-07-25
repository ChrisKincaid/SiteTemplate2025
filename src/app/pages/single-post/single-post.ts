import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostCard } from '../../layout/post-card/post-card';
import { CommentForm } from '../../comments/comment-form/comment-form';
import { CommentList } from '../../comments/comment-list/comment-list';
import { Posts } from '../../services/posts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-post',
  imports: [CommonModule, PostCard, CommentForm, CommentList], 
  templateUrl: './single-post.html',
  styleUrl: './single-post.css'
})
export class SinglePost implements OnInit, OnDestroy {
  currentPost: any = null;
  featuredPosts: any[] = [];
  randomFeaturedPosts: any[] = [];
  private subscription?: Subscription;
  private routeSubscription?: Subscription;

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
      console.log('Post ID from route:', postId);
      
      if (postId) {
        this.loadPostData(postId);
      }
    });
  }

  private loadPostData(postId: string) {
    this.subscription = this.postService.loadData().subscribe({
      next: (posts: any[]) => {
        console.log('All posts loaded:', posts.length);
        console.log('Looking for post with ID:', postId);
        
        // Find the current post by ID
        this.currentPost = posts.find(post => post.id === postId);
        console.log('Found current post:', this.currentPost?.data?.title);
        
        // Get featured posts for sidebar
        this.featuredPosts = posts.filter(post => post.data.isFeatured === true);
        console.log('Featured posts:', this.featuredPosts.length);
        
        // Get 3 random featured posts for sidebar (excluding current post)
        const availableFeatured = this.featuredPosts.filter(post => post.id !== postId);
        this.randomFeaturedPosts = this.getRandomPosts(availableFeatured, 3);
        console.log('Random featured posts for sidebar:', this.randomFeaturedPosts.length);
        
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
