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
    try {
      // Check for existing subscription
      const subscriptionsRef = collection(this.firestore, 'subscriptions');
      const emailQuery = query(
        subscriptionsRef, 
        where('email', '==', email.toLowerCase().trim())
      );
      
      const existingDocs = await getDocs(emailQuery);
      
      if (!existingDocs.empty) {
        return {
          success: false,
          message: 'This email is already subscribed to our newsletter.'
        };
      }
      
      const subscriptionData: Subscription = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subscribedAt: new Date(),
        status: 'active'
      };

      const addPromise = addDoc(subscriptionsRef, subscriptionData);
      const result = await Promise.race([
        addPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Add timeout after 10 seconds')), 10000)
        )
      ]);
      
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
