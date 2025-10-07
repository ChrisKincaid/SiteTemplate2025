# Firebase Storage Setup for Favicons

This setup provides complete favicon management with automatic generation of all required favicon formats.

## What's Included

### Storage Structure
```
/admin/favicon/          # Admin uploads (source files)
/public/favicon/         # Generated favicon files (public access)
/admin/site-images/      # Header/footer images (admin only)
/public/site-images/     # Active site images (public read)
/user-uploads/{userId}/  # User profile images
/posts/{postId}/         # Post images and media
```

### Generated Favicon Files
- `favicon.ico` (16×16, 32×32) - Traditional favicon
- `favicon-16x16.png` - Standard PNG favicon
- `favicon-32x32.png` - Standard PNG favicon  
- `apple-touch-icon.png` (180×180) - iOS home screen
- `android-chrome-192x192.png` - Android chrome
- `android-chrome-512x512.png` - Android chrome large

## Setup Steps

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Deploy Firebase Rules and Functions
```bash
# From the main project directory
firebase deploy --only storage,firestore,functions
```

### 3. Update Your HTML Template
Add these to your `<head>` section:

```html
<link rel="icon" type="image/x-icon" href="/public/favicon/favicon.ico?v={{faviconVersion}}">
<link rel="icon" type="image/png" sizes="16x16" href="/public/favicon/favicon-16x16.png?v={{faviconVersion}}">
<link rel="icon" type="image/png" sizes="32x32" href="/public/favicon/favicon-32x32.png?v={{faviconVersion}}">
<link rel="apple-touch-icon" sizes="180x180" href="/public/favicon/apple-touch-icon.png?v={{faviconVersion}}">
<link rel="icon" type="image/png" sizes="192x192" href="/public/favicon/android-chrome-192x192.png?v={{faviconVersion}}">
<link rel="icon" type="image/png" sizes="512x512" href="/public/favicon/android-chrome-512x512.png?v={{faviconVersion}}">
```

### 4. Service Integration
The favicon service methods are already set up:
- `getCurrentFavicon()` - Gets current favicon info from Firestore
- `getFaviconVersion()` - Gets version for cache busting
- `uploadFavicon(file)` - Uploads and triggers generation

## How It Works

1. **Upload**: Admin uploads square image to `admin/favicon/source-{timestamp}.png`
2. **Processing**: Cloud Function automatically generates all favicon sizes
3. **Storage**: Generated files saved to `public/favicon/` with public access
4. **Versioning**: Firestore updated with version number for cache busting
5. **Cleanup**: Weekly cleanup removes old source files (keeps 5 most recent)

## Security Rules

- ✅ Admin-only upload to `admin/favicon/`
- ✅ Public read access to `public/favicon/`
- ✅ Version-based cache busting
- ✅ Automatic cleanup of old files
- ✅ Proper content-type headers

## Testing

1. Upload a square PNG through the admin interface
2. Check Firebase Storage for generated files in `public/favicon/`
3. Verify Firestore `siteConfig/favicon` document has version info
4. Test public access to favicon URLs

## Troubleshooting

- **Function not triggering**: Check Firebase Console logs
- **Generated files missing**: Verify Storage rules are deployed
- **Upload fails**: Check user has admin role in Firestore
- **Images not square**: Function validates and crops to center automatically