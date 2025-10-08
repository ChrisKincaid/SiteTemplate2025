import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostCard } from '../../layout/post-card/post-card';
import { CommentsSectionComponent } from '../../components/comments-section/comments-section.component';
import { AudioPlayerComponent } from '../../components/audio-player/audio-player.component';
import { AudioPlayerService } from '../../services/audio-player.service';
import { Posts } from '../../services/posts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-post',
  imports: [CommonModule, PostCard, CommentsSectionComponent, AudioPlayerComponent], 
  templateUrl: './single-post.html',
  styleUrl: './single-post.css'
})
export class SinglePost implements OnInit, OnDestroy {
  currentPost: any = null;
  featuredPosts: any[] = [];
  randomFeaturedPosts: any[] = [];
  private subscription?: Subscription;
  private routeSubscription?: Subscription;
  private audioSubscription?: Subscription;
  private viewedPosts: Set<string> = new Set(); // Track viewed posts to prevent multiple increments
  
  // Audio player visibility state
  showInlinePlayer = true;
  floatingPlayerVisible = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: Posts,
    private audioPlayerService: AudioPlayerService,
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

    // Subscribe to audio player state to manage inline player visibility
    this.audioSubscription = this.audioPlayerService.audioState$.subscribe(state => {
      this.floatingPlayerVisible = state.floatingPlayerVisible;
      
      // Update visibility when audio state changes
      this.updateInlinePlayerVisibility();
      this.cdr.detectChanges();
    });

    // Initialize floating player visibility from current state
    const currentState = this.audioPlayerService.getCurrentState();
    this.floatingPlayerVisible = currentState.floatingPlayerVisible;
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
        
        // Update audio player visibility now that we have post data
        this.updateInlinePlayerVisibility();
        
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
    if (this.audioSubscription) {
      this.audioSubscription.unsubscribe();
    }
  }

  private updateInlinePlayerVisibility(): void {
    if (!this.hasAudio()) {
      this.showInlinePlayer = false;
      return;
    }

    const audioState = this.audioPlayerService.getCurrentState();
    
    // Hide inline player if ANY audio is playing (regardless of which post)
    // OR if this specific post's audio is loaded (even if paused)
    const shouldHideInlinePlayer = audioState.isPlaying || 
                                  (audioState.currentPostId === this.currentPost?.id && audioState.currentTrack);
    
    this.showInlinePlayer = !shouldHideInlinePlayer;
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

  // Check if current post has audio
  hasAudio(): boolean {
    return !!(this.currentPost?.data?.media?.type === 'audio' && 
             this.currentPost?.data?.media?.audio?.previewUrl);
  }

  // Get audio URL for playback
  getAudioUrl(): string | null {
    if (this.hasAudio()) {
      return this.currentPost.data.media.audio.previewUrl;
    }
    return null;
  }

  // Get audio title
  getAudioTitle(): string {
    if (this.hasAudio()) {
      return this.currentPost.data.media.audio.title || this.currentPost.data.title || 'Audio Track';
    }
    return '';
  }

  // Get audio artist/author
  getAudioArtist(): string {
    if (this.hasAudio()) {
      return this.currentPost.data.media.audio.artist || this.currentPost.data.author || 'Unknown Artist';
    }
    return '';
  }
}
