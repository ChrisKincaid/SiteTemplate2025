import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../services/subscription';

@Component({
  selector: 'app-subscription-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-form.html',
  styleUrl: './subscription-form.css'
})
export class SubscriptionForm {
  
  name: string = '';
  email: string = '';
  isSubmitting: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private subscriptionService: SubscriptionService,
    private cdr: ChangeDetectorRef
  ) {}

  async onSubmit() {
    // Reset previous messages
    this.message = '';
    this.messageType = '';

    // Validate form
    if (!this.name.trim()) {
      this.showMessage('Please enter your name.', 'error');
      return;
    }

    if (!this.email.trim()) {
      this.showMessage('Please enter your email address.', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.showMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Submit subscription
    this.isSubmitting = true;
    
    try {
      const result = await this.subscriptionService.addSubscription(this.name, this.email);
      
      if (result.success) {
        this.showMessage(result.message, 'success');
        this.resetForm();
      } else {
        this.showMessage(result.message, 'error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      this.showMessage('An unexpected error occurred. Please try again.', 'error');
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges(); // Force change detection
    }
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    this.cdr.detectChanges(); // Force change detection for message updates
    
    // Clear message after 5 seconds
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
      this.cdr.detectChanges(); // Force change detection when clearing message
    }, 5000);
  }

  private resetForm() {
    this.name = '';
    this.email = '';
  }
}
