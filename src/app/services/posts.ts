import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, increment } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Posts {

  constructor(private firestore: Firestore) {}

  loadData(): Observable<any[]> {
    // Modern Firebase v9+ syntax for loading collection data
    const postsRef = collection(this.firestore, 'posts');
    return collectionData(postsRef, { idField: 'id' }).pipe(
      map(posts => {
        const mappedPosts = posts.map(post => ({
          id: post['id'],
          data: post
        }));
        return mappedPosts;
      })
    );
  }

  async incrementViews(postId: string): Promise<void> {
    try {
      const postRef = doc(this.firestore, 'posts', postId);
      await updateDoc(postRef, {
        views: increment(1)
      });
      console.log('View count incremented for post:', postId);
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Fail silently - don't break the user experience if view tracking fails
    }
  }
  
}
