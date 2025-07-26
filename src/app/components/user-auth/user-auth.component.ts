import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-auth',
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Logged Out State -->
    <div class="btn-group" *ngIf="!currentUser">
      <button 
        type="button" 
        class="btn btn-info btn-theme" 
        data-toggle="dropdown" 
        aria-haspopup="true" 
        aria-expanded="false">
        Login
      </button>
      <div class="dropdown-menu dropdown-menu-right p-3" style="min-width: 300px;">
        <!-- Tab Navigation -->
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item">
            <a class="nav-link" 
               [class.active]="activeTab === 'signin'" 
               (click)="switchTab('signin', $event)">
              Sign In
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" 
               [class.active]="activeTab === 'signup'" 
               (click)="switchTab('signup', $event)">
              Sign Up
            </a>
          </li>
        </ul>

        <!-- Sign In Form -->
        <div *ngIf="activeTab === 'signin'">
          <form (ngSubmit)="signInWithEmail()">
            <fieldset [disabled]="isLoading">
            <div class="form-group mb-3">
              <input 
                type="email" 
                class="form-control form-control-sm" 
                placeholder="Email"
                [(ngModel)]="signInData.email"
                name="email"
                required>
            </div>
            <div class="form-group mb-3">
              <input 
                type="password" 
                class="form-control form-control-sm" 
                placeholder="Password"
                [(ngModel)]="signInData.password"
                name="password"
                required>
            </div>
            <button type="submit" class="btn btn-primary btn-sm w-100 mb-2" [disabled]="isLoading">
              Sign In
            </button>
            </fieldset>
          </form>
          
          <hr class="my-2">
          <small class="text-muted d-block text-center mb-2">or continue with</small>
          
          <div class="d-flex gap-1">
            <button 
              class="btn btn-danger btn-sm flex-fill"
              (click)="signInWithGoogle()"
              [disabled]="isLoading">
              <i class="fab fa-google"></i> Google
            </button>
            <button 
              class="btn btn-dark btn-sm flex-fill"
              (click)="signInWithGithub()"
              [disabled]="isLoading">
              <i class="fab fa-github"></i> GitHub
            </button>
          </div>
        </div>

        <!-- Sign Up Form -->
        <div *ngIf="activeTab === 'signup'">
          <form (ngSubmit)="signUpWithEmail()">
            <fieldset [disabled]="isLoading">
            <div class="form-group mb-3">
              <input 
                type="text" 
                class="form-control form-control-sm" 
                placeholder="Full Name"
                [(ngModel)]="signUpData.name"
                name="name"
                required>
            </div>
            <div class="form-group mb-3">
              <input 
                type="email" 
                class="form-control form-control-sm" 
                placeholder="Email"
                [(ngModel)]="signUpData.email"
                name="email"
                required>
            </div>
            <div class="form-group mb-3">
              <input 
                type="password" 
                class="form-control form-control-sm" 
                placeholder="Password (min 6 characters)"
                [(ngModel)]="signUpData.password"
                name="password"
                required
                minlength="6">
            </div>
            <button type="submit" class="btn btn-success btn-sm w-100 mb-2" [disabled]="isLoading">
              Create Account
            </button>
            </fieldset>
          </form>
          
          <hr class="my-2">
          <small class="text-muted d-block text-center mb-2">or sign up with</small>
          
          <div class="d-flex gap-1">
            <button 
              class="btn btn-danger btn-sm flex-fill"
              (click)="signInWithGoogle()"
              [disabled]="isLoading">
              <i class="fab fa-google"></i> Google
            </button>
            <button 
              class="btn btn-dark btn-sm flex-fill"
              (click)="signInWithGithub()"
              [disabled]="isLoading">
              <i class="fab fa-github"></i> GitHub
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div class="alert alert-danger alert-sm mt-2" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- Logged In State -->
    <div class="btn-group" *ngIf="currentUser">
      <button 
        type="button" 
        class="btn btn-info btn-theme user-profile-btn" 
        data-toggle="dropdown" 
        aria-haspopup="true" 
        aria-expanded="false"
        style="display: inline-block; white-space: nowrap; overflow: hidden; max-width: 200px; min-width: 120px; text-align: left; padding-left: 12px; padding-right: 12px;">
        <img 
          [src]="getUserImageSrc()" 
          class="rounded-circle profile-img"
          (error)="onImageError($event)"
          (load)="onImageLoad($event)"
          style="width: 20px; height: 20px; margin-right: 8px; display: inline-block; vertical-align: middle; float: left;"
          [style.display]="showProfileImage ? 'inline-block' : 'none'"> 
        <span style="display: inline-block; vertical-align: middle; color: rgba(255,255,255,0.7); font-size: 11px; margin-right: 6px;">Profile</span>
        <span class="username-text" style="display: inline-block; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; max-width: 120px; color: #ffffff; font-weight: 500;">{{ currentUser.displayName || currentUser.email }}</span>
      </button>
      <div class="dropdown-menu dropdown-menu-right">
        <h6 class="dropdown-header">{{ currentUser.displayName || 'User' }}</h6>
        <div class="dropdown-item-text">
          <small class="text-muted">{{ currentUser.email }}</small>
        </div>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" (click)="toggleSubscription()" [disabled]="isSubscriptionLoading">
          <i class="fas fa-envelope me-2"></i>
          <span *ngIf="!isSubscriptionLoading">{{ isUserSubscribed ? 'Unsubscribe from Newsletter' : 'Subscribe to Newsletter' }}</span>
          <span *ngIf="isSubscriptionLoading">
            <i class="fas fa-spinner fa-spin me-1"></i>Updating...
          </span>
        </button>
        <button class="dropdown-item" (click)="signOut()">
          <i class="fas fa-sign-out-alt me-2"></i>Sign Out
        </button>
      </div>
    </div>
  `,
  styles: [`
    .nav-tabs .nav-link {
      font-size: 12px;
      padding: 5px 10px;
      cursor: pointer;
    }
    .gap-1 {
      gap: 0.25rem;
    }
    .flex-fill {
      flex: 1 1 0%;
    }
    .alert-sm {
      font-size: 12px;
      padding: 0.25rem 0.5rem;
    }
    .dropdown-menu {
      border: 1px solid #dee2e6;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    
    
    /* AGGRESSIVE FIX for profile button horizontal layout */
    .user-profile-btn {
      display: inline-flex !important;
      align-items: center !important;
      flex-direction: row !important;
      white-space: nowrap !important;
      min-width: 120px !important;
      max-width: 200px !important;
      gap: 8px !important;
      text-align: left !important;
      justify-content: flex-start !important;
    }
    
    /* Triple override for Bootstrap conflicts */
    .btn.user-profile-btn,
    .btn-group .btn.user-profile-btn,
    .dropdown-toggle.user-profile-btn {
      display: inline-flex !important;
      flex-direction: row !important;
      align-items: center !important;
      flex-wrap: nowrap !important;
    }
    
    .profile-img {
      width: 20px !important;
      height: 20px !important;
      flex-shrink: 0 !important;
      order: 1 !important;
      margin-right: 8px !important;
      margin-left: 0 !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      float: none !important;
      display: inline-block !important;
    }
    
    .username-text {
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      flex: 1 !important;
      text-align: left !important;
      order: 2 !important;
      display: inline-block !important;
      vertical-align: middle !important;
      line-height: 1.2 !important;
      margin: 0 !important;
      padding: 0 !important;
      float: none !important;
    }
    
    /* Ensure the button content flows horizontally */
    .user-profile-btn > * {
      display: inline-block !important;
      vertical-align: middle !important;
      float: none !important;
    }
  `]
})
export class UserAuthComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  activeTab: 'signin' | 'signup' = 'signin';
  isLoading = false;
  errorMessage = '';
  showProfileImage = true;
  isUserSubscribed = false;
  isSubscriptionLoading = false;
  
  signInData = {
    email: '',
    password: ''
  };
  
  signUpData = {
    name: '',
    email: '',
    password: ''
  };

  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.user$.subscribe(async user => {
      this.currentUser = user;
      this.showProfileImage = true; // Reset image visibility for new user
      
      // Check subscription status when user changes
      if (user?.email) {
        await this.checkSubscriptionStatus();
      } else {
        this.isUserSubscribed = false;
      }
      
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async signInWithEmail() {
    if (!this.signInData.email || !this.signInData.password) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signInWithEmail(this.signInData.email, this.signInData.password);
      this.resetForms();
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  async signUpWithEmail() {
    if (!this.signUpData.name || !this.signUpData.email || !this.signUpData.password) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signUpWithEmail(this.signUpData.email, this.signUpData.password, this.signUpData.name);
      this.resetForms();
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.errorMessage = 'Failed to sign in with Google';
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGithub() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signInWithGithub();
    } catch (error: any) {
      this.errorMessage = 'Failed to sign in with GitHub';
    } finally {
      this.isLoading = false;
    }
  }

  async signOut() {
    await this.authService.signOut();
  }

  switchTab(tab: 'signin' | 'signup', event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.activeTab = tab;
  }

  async checkSubscriptionStatus() {
    if (!this.currentUser?.email) return;
    
    try {
      this.isUserSubscribed = await this.subscriptionService.isEmailSubscribed(this.currentUser.email);
    } catch (error) {
      console.warn('Failed to check subscription status:', error);
      this.isUserSubscribed = false;
    }
  }

  async toggleSubscription() {
    if (!this.currentUser?.email) return;
    
    this.isSubscriptionLoading = true;
    
    try {
      if (this.isUserSubscribed) {
        // Unsubscribe the user
        const result = await this.subscriptionService.unsubscribe(this.currentUser.email);
        if (result.success) {
          this.isUserSubscribed = false;
        }
      } else {
        // Subscribe the user
        const userName = this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'User';
        const result = await this.subscriptionService.addSubscription(userName, this.currentUser.email);
        if (result.success) {
          this.isUserSubscribed = true;
        }
      }
    } catch (error) {
      console.error('Subscription toggle failed:', error);
      // Show error feedback if needed
    } finally {
      this.isSubscriptionLoading = false;
    }
  }

  onImageError(event: any): void {
    this.showProfileImage = false;
  }

  onImageLoad(event: any): void {
    this.showProfileImage = true;
  }

  getUserImageSrc(): string {
    if (this.currentUser?.photoURL) {
      return this.currentUser.photoURL;
    }
    return '/assets/default-avatar.png';
  }

  private resetForms() {
    this.signInData = { email: '', password: '' };
    this.signUpData = { name: '', email: '', password: '' };
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email already registered';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}
