import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommentsService, Comment } from '../../services/comments.service';
import { LoginComponent } from '../login/login.component';
import { CommentFormComponent } from '../comment-form/comment-form.component';
import { CommentItemComponent } from '../comment-item/comment-item.component';

@Component({
  selector: 'app-comments-section',
  imports: [CommonModule, LoginComponent, CommentFormComponent, CommentItemComponent],
  template: `
    <div class="comments-section mt-5">
      <!-- Comments Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">
          <i class="fas fa-comments me-2 text-primary"></i>
          Comments ({{ comments.length }})
        </h4>
      </div>

      <!-- User Status -->
      <div *ngIf="isLoggedIn" class="user-status mb-3 p-3 bg-light rounded">
        <div class="d-flex align-items-center gap-3">
          <img 
            [src]="currentUser?.photoURL || '/assets/default-avatar.png'"
            [alt]="currentUser?.displayName || 'User'"
            class="rounded-circle"
            style="width: 32px; height: 32px; object-fit: cover;">
          <span class="text-muted">
            Signed in as <strong>{{ currentUser?.displayName || 'Anonymous' }}</strong>
          </span>
        </div>
      </div>

      <!-- Login Section (Not Logged In) -->
      <app-login *ngIf="!isLoggedIn" class="mb-4"></app-login>

      <!-- Comment Form (Logged In) -->
      <div *ngIf="isLoggedIn" class="mb-4">
        <app-comment-form 
          [postId]="postId"
          (commentAdded)="onCommentAdded()">
        </app-comment-form>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-3">
        <small class="text-muted">Loading comments...</small>
      </div>

      <!-- Comments List -->
      <div *ngIf="!isLoading" class="comments-list">
        <!-- No Comments -->
        <div *ngIf="comments.length === 0" class="text-center py-5">
          <i class="fas fa-comment-alt fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No comments yet</h5>
          <p class="text-muted">
            {{ isLoggedIn ? 'Be the first to share your thoughts!' : 'Sign in to start the conversation!' }}
          </p>
        </div>

        <!-- Comments -->
        <div *ngIf="comments.length > 0">
          <!-- Top-level Comments -->
          <div *ngFor="let comment of topLevelComments" class="mb-4">
            <app-comment-item 
              [comment]="comment"
              (commentUpdated)="onCommentUpdated()"
              (commentDeleted)="onCommentDeleted($event)">
            </app-comment-item>
            
            <!-- Replies -->
            <div *ngIf="getReplies(comment.id!).length > 0" class="replies ms-5 mt-3">
              <div *ngFor="let reply of getReplies(comment.id!)" class="mb-3">
                <app-comment-item 
                  [comment]="reply"
                  (commentUpdated)="onCommentUpdated()"
                  (commentDeleted)="onCommentDeleted($event)">
                </app-comment-item>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .comments-section {
      background-color: #fff;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .user-status {
      border: 1px solid #e0e0e0;
    }
    
    .replies {
      position: relative;
    }
    
    .replies::before {
      content: '';
      position: absolute;
      left: -20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #e0e0e0;
    }
    
    .comments-footer {
      background-color: #f8f9fa;
      margin: 0 -2rem -2rem -2rem;
      padding: 1rem 2rem;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  `]
})
export class CommentsSectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() postId!: string;

  comments: Comment[] = [];
  topLevelComments: Comment[] = [];
  isLoading = true;
  currentUser: any = null;
  
  private commentsSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    // Load comments
    this.loadComments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If postId changed, reload comments
    if (changes['postId'] && !changes['postId'].firstChange) {
      this.loadComments();
    }
  }

  ngOnDestroy(): void {
    if (this.commentsSubscription) {
      this.commentsSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  loadComments(): void {
    if (!this.postId) {
      this.isLoading = false;
      return;
    }
    
    // Unsubscribe from previous comments subscription if it exists
    if (this.commentsSubscription) {
      this.commentsSubscription.unsubscribe();
    }
    
    this.isLoading = true;
    
    // Set a timeout to prevent infinite loading
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 3000); // 3 second timeout
    
    this.commentsSubscription = this.commentsService.getCommentsForPost(this.postId)
      .subscribe({
        next: (comments) => {
          this.comments = comments;
          this.topLevelComments = comments.filter(c => !c.parentId);
          this.isLoading = false;
          this.cdr.detectChanges(); // Force Angular to update the UI
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.isLoading = false;
        }
      });
  }

  getReplies(commentId: string): Comment[] {
    return this.comments.filter(c => c.parentId === commentId);
  }

  onCommentAdded(): void {
    // Comments will auto-update via real-time subscription
  }

  onCommentUpdated(): void {
    // Comments will auto-update via real-time subscription
  }

  onCommentDeleted(commentId: string): void {
    // Comments will auto-update via real-time subscription
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
