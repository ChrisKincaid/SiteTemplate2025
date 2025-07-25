import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';

export interface Subscription {
  name: string;
  email: string;
  subscribedAt: Date;
  status: 'active' | 'unsubscribed';
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private firestore: Firestore) {}

  async addSubscription(name: string, email: string): Promise<{ success: boolean; message: string }> {
    console.log('addSubscription called with:', { name, email });
    
    try {
      // Check for existing subscription
      console.log('Checking for existing subscription...');
      const subscriptionsRef = collection(this.firestore, 'subscriptions');
      const emailQuery = query(
        subscriptionsRef, 
        where('email', '==', email.toLowerCase().trim())
      );
      
      const existingDocs = await getDocs(emailQuery);
      
      if (!existingDocs.empty) {
        console.log('Email already exists in database');
        return {
          success: false,
          message: 'This email is already subscribed to our newsletter.'
        };
      }
      
      console.log('Email not found, adding new subscription...');
      
      const subscriptionData: Subscription = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subscribedAt: new Date(),
        status: 'active'
      };

      console.log('Subscription data prepared:', subscriptionData);

      const addPromise = addDoc(subscriptionsRef, subscriptionData);
      const result = await Promise.race([
        addPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Add timeout after 10 seconds')), 10000)
        )
      ]);
      
      console.log('Subscription added successfully:', result);
      return {
        success: true,
        message: 'Thank you for subscribing! You will receive our latest updates.'
      };

    } catch (error) {
      console.error('Error adding subscription:', error);
      
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
        
        if (error.message.includes('timeout')) {
          return {
            success: false,
            message: 'Request timeout. Please check your connection and try again.'
          };
        }
        
        if (error.message.includes('permission')) {
          return {
            success: false,
            message: 'Permission denied. Please contact support.'
          };
        }
      }
      
      return {
        success: false,
        message: 'Sorry, there was an error. Please try again later.'
      };
    }
  }
}
