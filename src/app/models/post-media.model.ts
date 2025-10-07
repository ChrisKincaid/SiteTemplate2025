export interface PostMedia {
  type: 'video' | 'audio' | null;
  
  // Video properties (external links only)
  videoUrl?: string;
  videoTitle?: string;
  videoProvider?: 'youtube' | 'vimeo' | 'other';
  videoEmbedCode?: string;
  
  // Audio properties (uploads only)
  audioTitle?: string;
  previewUrl?: string;      // Public preview file (30-60 seconds) - playable everywhere
  fullUrl?: string;         // Private full track - NEVER playable on site, download only
  
  // Pricing settings
  exclusivePrice?: number;     // Price when selling exclusively to one buyer
  nonExclusivePrice?: number;  // Price after exclusive period ends
  exclusiveExpiresAt?: Date;   // When exclusive period ends
  
  // Purchase tracking
  isExclusive: boolean;        // Current status - is it still available exclusively?
  exclusiveBuyer?: string;     // User ID who bought it exclusively (if sold)
  
  // Metadata
  duration?: number;           // Duration in seconds
  fileSize?: number;          // File size in bytes (for audio files)
  genre?: string;             // Music genre
  tags?: string[];            // Additional tags
  createdAt: Date;
  updatedAt?: Date;
}

export interface AudioTrack {
  id: string;
  title: string;
  
  // File URLs
  previewUrl: string;         // Always required - public preview
  fullUrl?: string;           // Optional - private full track for paid content
  
  // Commerce settings
  isPaid: boolean;
  exclusivePrice?: number;
  nonExclusivePrice?: number;
  exclusiveExpiresAt?: Date;
  
  // Status
  isExclusive: boolean;
  exclusiveBuyer?: string;
  
  // Metadata
  duration?: number;
  fileSize?: number;
  genre?: string;
  tags?: string[];
  createdAt: Date;
}

export interface VideoEmbed {
  url: string;
  title?: string;
  provider: 'youtube' | 'vimeo' | 'other';
  embedCode?: string;
  thumbnailUrl?: string;
  duration?: number;
}

// Helper interface for purchase tracking
export interface MediaPurchase {
  id: string;
  userId: string;
  postId: string;
  mediaType: 'audio';         // Only audio can be purchased
  purchaseType: 'exclusive' | 'non-exclusive';
  price: number;
  currency: string;
  stripeSessionId?: string;
  purchasedAt: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}