import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, increment } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Comment {
  id?: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string; // For replies
  likes: number;
  isDeleted: boolean;
  isHidden: boolean;
  reportCount: number;
  isReported: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private firestore: Firestore) {}

  // Get comments for a specific post
  getCommentsForPost(postId: string): Observable<Comment[]> {
    return new Observable(observer => {
      const commentsRef = collection(this.firestore, 'comments');
      const q = query(
        commentsRef,
        where('postId', '==', postId)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const comments: Comment[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Filter out deleted/hidden comments in code instead of query
          if (data['isDeleted'] !== true && data['isHidden'] !== true) {
            // Convert Firestore timestamp to Date
            const comment = {
              id: doc.id,
              ...data,
              createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : data['createdAt'],
              updatedAt: data['updatedAt']?.toDate ? data['updatedAt'].toDate() : data['updatedAt']
            } as Comment;
            comments.push(comment);
          }
        });
        // Sort by createdAt in JavaScript instead of Firestore
        comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        observer.next(comments);
      });

      return () => unsubscribe();
    });
  }

  // Add a new comment
  async addComment(postId: string, content: string, userId: string, userName: string, userPhoto: string, parentId?: string): Promise<void> {
    const commentsRef = collection(this.firestore, 'comments');
    
    const newComment: any = {
      postId,
      userId,
      userName,
      userPhoto,
      content: content.trim(),
      createdAt: new Date(),
      likes: 0,
      isDeleted: false,
      isHidden: false,
      reportCount: 0,
      isReported: false
    };

    // Only add parentId if it's provided
    if (parentId) {
      newComment.parentId = parentId;
    }

    await addDoc(commentsRef, newComment);
  }

  // Update comment content
  async updateComment(commentId: string, content: string): Promise<void> {
    const commentRef = doc(this.firestore, 'comments', commentId);
    await updateDoc(commentRef, {
      content: content.trim(),
      updatedAt: new Date()
    });
  }

  // Delete comment (user delete - soft delete)
  async deleteComment(commentId: string): Promise<void> {
    const commentRef = doc(this.firestore, 'comments', commentId);
    await updateDoc(commentRef, {
      isDeleted: true,
      updatedAt: new Date()
    });
  }

  // Like/unlike comment
  async toggleLike(commentId: string, isLiking: boolean): Promise<void> {
    const commentRef = doc(this.firestore, 'comments', commentId);
    await updateDoc(commentRef, {
      likes: increment(isLiking ? 1 : -1)
    });
  }

  // Report comment
  async reportComment(commentId: string): Promise<void> {
    const commentRef = doc(this.firestore, 'comments', commentId);
    await updateDoc(commentRef, {
      reportCount: increment(1),
      isReported: true
    });
  }
}
