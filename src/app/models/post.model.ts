import { PostMedia } from './post-media.model';

export interface Post {
  id: string;
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  
  // Author information
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  
  // Post metadata
  category?: string;
  tags?: string[];
  featured: boolean;
  published: boolean;
  
  // NEW: Media attachment (optional)
  media?: PostMedia;
  
  // Engagement
  viewCount: number;
  likeCount: number;
  commentCount: number;
  
  // SEO
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

// For creating new posts
export interface CreatePostRequest {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  media?: PostMedia;           // NEW: Optional media
  metaDescription?: string;
  metaKeywords?: string[];
}

// For updating existing posts
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  media?: PostMedia;           // NEW: Optional media updates
  metaDescription?: string;
  metaKeywords?: string[];
}