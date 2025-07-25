import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
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
        class="btn btn-outline-primary btn-sm dropdown-toggle" 
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
               (click)="activeTab = 'signin'">
              Sign In
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" 
               [class.active]="activeTab === 'signup'" 
               (click)="activeTab = 'signup'">
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
        class="btn btn-outline-success btn-sm dropdown-toggle d-flex align-items-center" 
        data-toggle="dropdown" 
        aria-haspopup="true" 
        aria-expanded="false">
        <img 
          [src]="currentUser.photoURL || '/assets/default-avatar.png'" 
          alt="Profile" 
          class="rounded-circle me-2" 
          style="width: 20px; height: 20px;">
        {{ currentUser.displayName || currentUser.email }}
      </button>
      <div class="dropdown-menu dropdown-menu-right">
        <h6 class="dropdown-header">{{ currentUser.displayName || 'User' }}</h6>
        <div class="dropdown-item-text">
          <small class="text-muted">{{ currentUser.email }}</small>
        </div>
        <div class="dropdown-divider"></div>
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
  `]
})
export class UserAuthComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  activeTab: 'signin' | 'signup' = 'signin';
  isLoading = false;
  errorMessage = '';
  
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.currentUser = user;
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
