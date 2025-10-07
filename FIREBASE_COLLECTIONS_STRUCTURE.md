# Firebase Collections Structure for Media System

## Core Collections

### 1. `posts` Collection
```typescript
posts/{postId} = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  // ... existing fields
  
  // NEW FIELD
  media?: {
    type: 'video' | 'audio' | null;
    
    // Video (external links)
    videoUrl?: string;
    videoTitle?: string;
    videoProvider?: 'youtube' | 'vimeo' | 'other';
    
    // Audio (Firebase Storage files)
    audioTitle?: string;
    previewUrl?: string;      // gs://bucket/audio/previews/{postId}.mp3
    fullUrl?: string;         // gs://bucket/audio/full/{postId}.mp3
    
    // Pricing
    exclusivePrice?: number;
    nonExclusivePrice?: number;
    exclusiveExpiresAt?: Date;
    
    // Status
    isExclusive: boolean;
    exclusiveBuyer?: string;  // userId
    
    // Metadata
    duration?: number;
    fileSize?: number;
    createdAt: Date;
  }
}
```

### 2. `purchases` Collection (NEW)
```typescript
purchases/{purchaseId} = {
  id: string;
  userId: string;
  postId: string;
  mediaType: 'audio';
  purchaseType: 'exclusive' | 'non-exclusive';
  price: number;
  currency: 'usd';
  stripeSessionId?: string;
  purchasedAt: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}
```

## Firebase Storage Structure

### Audio Files Organization
```
/audio/
  /previews/               # Public access
    {postId}-preview.mp3   # 30-60 second samples
  /full/                   # Private access (requires purchase verification)
    {postId}-full.mp3      # Complete tracks for download
```

## Security Rules

### Firestore Rules Updates
```javascript
// posts collection - add media field validation
match /posts/{postId} {
  allow read: if true;
  allow write: if request.auth != null 
               && request.auth.uid == resource.data.authorId
               && validateMediaData(request.data.media);
}

// NEW: purchases collection
match /purchases/{purchaseId} {
  allow read: if request.auth != null 
              && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null 
                && request.auth.uid == request.resource.data.userId;
}

function validateMediaData(media) {
  return media == null || (
    media.type in ['video', 'audio'] &&
    (media.type == 'video' ? media.videoUrl is string : true) &&
    (media.type == 'audio' ? media.audioTitle is string : true)
  );
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public audio previews
    match /audio/previews/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Private full audio tracks
    match /audio/full/{allPaths=**} {
      allow read: if false;  // Only accessible via Cloud Functions
      allow write: if request.auth != null;
    }
  }
}
```

## Indexes Required

### Firestore Indexes
```javascript
// For querying user purchases
purchases: {
  fields: ['userId', 'status', 'purchasedAt'],
  order: 'DESC'
}

// For querying exclusive tracks expiring soon
posts: {
  fields: ['media.isExclusive', 'media.exclusiveExpiresAt'],
  order: 'ASC'
}
```

## Migration Considerations

### Existing Posts
- All existing posts will have `media: null` or undefined
- No breaking changes to existing functionality
- Media field is completely optional

### Data Validation
- Audio files: Accept common formats (MP3, WAV, M4A)
- File size limits: Preview (10MB max), Full track (100MB max)
- Video URLs: Validate YouTube/Vimeo URL patterns

## Cloud Functions Triggers

### Required Functions
1. `onPostMediaUpload` - Process audio uploads, generate metadata
2. `onPurchaseComplete` - Handle Stripe webhook, grant access
3. `onExclusiveExpired` - Update expired exclusive tracks
4. `generateSecureDownload` - Create temporary download URLs