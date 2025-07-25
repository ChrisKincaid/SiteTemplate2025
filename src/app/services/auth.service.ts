import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut, user, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface PublicUser {
  email: string;
  name: string;
  photoURL: string;
  provider: string;
  createdAt: Date;
  isBlocked?: boolean;
  isBanned?: boolean;
  moderationNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.user$ = user(this.auth);
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    await this.createUserProfile(result.user, 'google');
  }

  async signInWithGithub(): Promise<void> {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    await this.createUserProfile(result.user, 'github');
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  private async createUserProfile(user: User, provider: string): Promise<void> {
    const userRef = doc(this.firestore, 'users-public', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const publicUser: PublicUser = {
        email: user.email || '',
        name: user.displayName || '',
        photoURL: user.photoURL || '',
        provider: provider,
        createdAt: new Date(),
        isBlocked: false,
        isBanned: false,
        moderationNotes: ''
      };

      await setDoc(userRef, publicUser);
    }
  }

  // Email/Password Authentication
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    // Update the user's display name
    await updateProfile(credential.user, { displayName });
    
    // Create public user profile
    await this.createUserProfile(credential.user, 'email');
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
