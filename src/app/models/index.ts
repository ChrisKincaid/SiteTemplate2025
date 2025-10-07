// Export all model interfaces from a single location
export * from './post.model';
export * from './post-media.model';

// Re-export for convenience
export type { Post, CreatePostRequest, UpdatePostRequest } from './post.model';
export type { 
  PostMedia, 
  AudioTrack, 
  VideoEmbed, 
  MediaPurchase 
} from './post-media.model';