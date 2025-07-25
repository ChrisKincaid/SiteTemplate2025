import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  template: `
    <div class="login-section p-3 bg-light rounded text-center">
      <h6 class="mb-3">Sign in to join the conversation</h6>
      <p class="text-muted mb-3">Please use the Login button in the top navigation to sign in or create an account.</p>
      <div class="d-flex flex-column gap-2">
        <button 
          class="btn btn-danger btn-sm d-flex align-items-center justify-content-center"
          (click)="signInWithGoogle()"
          [disabled]="isLoading">
          <i class="fab fa-google me-2"></i>
          Quick Sign-in with Google
        </button>
        <button 
          class="btn btn-dark btn-sm d-flex align-items-center justify-content-center"
          (click)="signInWithGithub()"
          [disabled]="isLoading">
          <i class="fab fa-github me-2"></i>
          Quick Sign-in with GitHub
        </button>
      </div>
      <p class="text-muted mt-2 mb-0" style="font-size: 11px;">
        Or scroll to the top and use the Login button for email/password options.
      </p>
    </div>
  `,
  styles: [`
    .login-section {
      border: 1px solid #e0e0e0;
    }
    .btn {
      transition: all 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
  `]
})
export class LoginComponent {
  isLoading = false;

  constructor(private authService: AuthService) {}

  async signInWithGoogle(): Promise<void> {
    this.isLoading = true;
    try {
      await this.authService.signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGithub(): Promise<void> {
    this.isLoading = true;
    try {
      await this.authService.signInWithGithub();
    } catch (error) {
      console.error('GitHub sign-in error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
