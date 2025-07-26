import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';

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

  async isEmailSubscribed(email: string): Promise<boolean> {
    try {
      if (!email) return false;
      
      const subscriptionsRef = collection(this.firestore, 'subscriptions');
      const emailQuery = query(
        subscriptionsRef, 
        where('email', '==', email.toLowerCase().trim()),
        where('status', '==', 'active')
      );
      
      const existingDocs = await getDocs(emailQuery);
      return !existingDocs.empty;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!email) {
        return {
          success: false,
          message: 'Email is required'
        };
      }

      const subscriptionsRef = collection(this.firestore, 'subscriptions');
      const emailQuery = query(
        subscriptionsRef, 
        where('email', '==', email.toLowerCase().trim()),
        where('status', '==', 'active')
      );
      
      const existingDocs = await getDocs(emailQuery);
      
      if (existingDocs.empty) {
        return {
          success: false,
          message: 'Email not found in active subscriptions'
        };
      }

      // Update all active subscriptions for this email to 'unsubscribed'
      const updatePromises = existingDocs.docs.map(docSnapshot => {
        const docRef = doc(this.firestore, 'subscriptions', docSnapshot.id);
        return updateDoc(docRef, { status: 'unsubscribed' });
      });

      await Promise.all(updatePromises);

      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      };

    } catch (error) {
      console.error('Error unsubscribing:', error);
      return {
        success: false,
        message: 'Failed to unsubscribe. Please try again later.'
      };
    }
  }
}
