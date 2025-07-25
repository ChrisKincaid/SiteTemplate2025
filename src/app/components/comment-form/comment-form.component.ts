import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-comment-form',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comment-form bg-light p-3 rounded">
      <div class="d-flex align-items-start gap-3">
        <img 
          [src]="userPhoto || '/assets/default-avatar.png'" 
          [alt]="userName"
          class="rounded-circle"
          style="width: 40px; height: 40px; object-fit: cover;">
        
        <div class="flex-grow-1">
          <textarea 
            [(ngModel)]="commentText"
            class="form-control mb-2"
            rows="3"
            placeholder="Share your thoughts..."
            [disabled]="isSubmitting"
            maxlength="1000">
          </textarea>
          
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">{{ commentText.length }}/1000</small>
            <div class="d-flex gap-2">
              <button 
                type="button"
                class="btn btn-secondary btn-sm"
                (click)="cancel()"
                [disabled]="isSubmitting">
                Cancel
              </button>
              <button 
                type="button"
                class="btn btn-primary btn-sm"
                (click)="submitComment()"
                [disabled]="!commentText.trim() || isSubmitting">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isReply ? 'Reply' : 'Comment' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comment-form {
      border: 1px solid #e0e0e0;
    }
    textarea {
      border: 1px solid #ddd;
      resize: vertical;
      min-height: 80px;
    }
    textarea:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(2, 100, 103, 0.25);
    }
  `]
})
export class CommentFormComponent {
  @Input() postId!: string;
  @Input() parentId?: string; // For replies
  @Input() isReply = false;
  @Output() commentAdded = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  commentText = '';
  isSubmitting = false;
  userName = '';
  userPhoto = '';

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService
  ) {
    // Get current user info
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.displayName || 'Anonymous';
      this.userPhoto = currentUser.photoURL || '';
    }
  }

  async submitComment(): Promise<void> {
    if (!this.commentText.trim()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.isSubmitting = true;

    try {
      await this.commentsService.addComment(
        this.postId,
        this.commentText,
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        currentUser.photoURL || '',
        this.parentId
      );

      this.commentText = '';
      this.commentAdded.emit();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    this.commentText = '';
    this.cancelled.emit();
  }
}
