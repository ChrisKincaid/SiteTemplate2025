import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../services/comments.service';
import { AuthService } from '../../services/auth.service';
import { CommentsService } from '../../services/comments.service';
import { CommentFormComponent } from '../comment-form/comment-form.component';

@Component({
  selector: 'app-comment-item',
  imports: [CommonModule, FormsModule, CommentFormComponent],
  template: `
    <div class="comment-item mb-3">
      <div class="d-flex align-items-start gap-3">
        <!-- User Avatar -->
        <img 
          [src]="comment.userPhoto || '/assets/default-avatar.png'" 
          [alt]="comment.userName"
          class="rounded-circle flex-shrink-0"
          style="width: 40px; height: 40px; object-fit: cover;">
        
        <!-- Comment Content -->
        <div class="flex-grow-1">
          <!-- User Info & Time -->
          <div class="d-flex align-items-center gap-2 mb-1">
            <strong class="text-dark">{{ comment.userName }}</strong>
            <small class="text-muted">{{ getTimeAgo(comment.createdAt) }}</small>
            <small *ngIf="comment.updatedAt" class="text-muted">(edited)</small>
          </div>
          
          <!-- Comment Text -->
          <div *ngIf="!isEditing" class="comment-content mb-2">
            <p class="mb-0">{{ comment.content }}</p>
          </div>
          
          <!-- Edit Form -->
          <div *ngIf="isEditing" class="mb-2">
            <textarea 
              [(ngModel)]="editText"
              class="form-control mb-2"
              rows="3"
              maxlength="1000">
            </textarea>
            <div class="d-flex gap-2">
              <button 
                class="btn btn-primary btn-sm"
                (click)="saveEdit()"
                [disabled]="!editText.trim() || isLoading">
                Save
              </button>
              <button 
                class="btn btn-secondary btn-sm"
                (click)="cancelEdit()">
                Cancel
              </button>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="d-flex align-items-center gap-3 text-muted">
            <!-- Like Button -->
            <button 
              class="btn btn-link btn-sm p-0 text-muted d-flex align-items-center gap-1"
              (click)="toggleLike()"
              [disabled]="!isLoggedIn">
              <i class="fas fa-heart" [class.text-danger]="userHasLiked"></i>
              <span>{{ comment.likes || 0 }}</span>
            </button>
            
            <!-- Reply Button -->
            <button 
              *ngIf="!comment.parentId"
              class="btn btn-link btn-sm p-0 text-muted"
              (click)="toggleReply()"
              [disabled]="!isLoggedIn">
              <i class="fas fa-reply me-1"></i>Reply
            </button>
            
            <!-- Edit Button (Own Comments) -->
            <button 
              *ngIf="canEdit"
              class="btn btn-link btn-sm p-0 text-muted"
              (click)="startEdit()">
              <i class="fas fa-edit me-1"></i>Edit
            </button>
            
            <!-- Delete Button (Own Comments) -->
            <button 
              *ngIf="canDelete"
              class="btn btn-link btn-sm p-0 text-danger"
              (click)="deleteComment()">
              <i class="fas fa-trash me-1"></i>Delete
            </button>
            
            <!-- Report Button -->
            <button 
              *ngIf="!isOwner && isLoggedIn"
              class="btn btn-link btn-sm p-0 text-muted"
              (click)="reportComment()"
              [disabled]="hasReported">
              <i class="fas fa-flag me-1"></i>
              {{ hasReported ? 'Reported' : 'Report' }}
            </button>
          </div>
          
          <!-- Reply Form -->
          <div *ngIf="showReplyForm" class="mt-3">
            <app-comment-form 
              [postId]="comment.postId"
              [parentId]="comment.id"
              [isReply]="true"
              (commentAdded)="onReplyAdded()"
              (cancelled)="toggleReply()">
            </app-comment-form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comment-item {
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid var(--primary-color);
    }
    
    .comment-content {
      line-height: 1.5;
      word-wrap: break-word;
    }
    
    .btn-link {
      text-decoration: none;
      font-size: 13px;
    }
    
    .btn-link:hover {
      text-decoration: underline;
    }
    
    textarea {
      border: 1px solid #ddd;
      resize: vertical;
    }
    
    textarea:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(2, 100, 103, 0.25);
    }
  `]
})
export class CommentItemComponent {
  @Input() comment!: Comment;
  @Output() commentUpdated = new EventEmitter<void>();
  @Output() commentDeleted = new EventEmitter<string>();

  isEditing = false;
  editText = '';
  showReplyForm = false;
  isLoading = false;
  userHasLiked = false; // TODO: Track user likes
  hasReported = false; // TODO: Track user reports

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService
  ) {}

  get isLoggedIn(): boolean {
    return !!this.authService.getCurrentUser();
  }

  get isOwner(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.uid === this.comment.userId;
  }

  get canEdit(): boolean {
    return this.isOwner && this.isLoggedIn;
  }

  get canDelete(): boolean {
    return this.isOwner && this.isLoggedIn;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }

  formatComment(content: string): string {
    // Basic formatting - convert line breaks to <br>
    return content.replace(/\n/g, '<br>');
  }

  async toggleLike(): Promise<void> {
    if (!this.isLoggedIn || !this.comment.id) return;
    
    try {
      this.userHasLiked = !this.userHasLiked;
      await this.commentsService.toggleLike(this.comment.id, this.userHasLiked);
      this.commentUpdated.emit();
    } catch (error) {
      console.error('Error toggling like:', error);
      this.userHasLiked = !this.userHasLiked; // Revert on error
    }
  }

  toggleReply(): void {
    this.showReplyForm = !this.showReplyForm;
  }

  onReplyAdded(): void {
    this.showReplyForm = false;
    this.commentUpdated.emit();
  }

  startEdit(): void {
    this.editText = this.comment.content;
    this.isEditing = true;
  }

  async saveEdit(): Promise<void> {
    if (!this.editText.trim() || !this.comment.id) return;
    
    this.isLoading = true;
    try {
      await this.commentsService.updateComment(this.comment.id, this.editText);
      this.isEditing = false;
      this.commentUpdated.emit();
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editText = '';
  }

  async deleteComment(): Promise<void> {
    if (!this.comment.id) return;
    
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await this.commentsService.deleteComment(this.comment.id);
        this.commentDeleted.emit(this.comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  }

  async reportComment(): Promise<void> {
    if (!this.comment.id || this.hasReported) return;
    
    if (confirm('Report this comment as inappropriate?')) {
      try {
        await this.commentsService.reportComment(this.comment.id);
        this.hasReported = true;
      } catch (error) {
        console.error('Error reporting comment:', error);
      }
    }
  }
}
