# Favicon Troubleshooting Guide

## Check These Steps:

### 1. Verify Upload Location
- Check Firebase Storage Console
- Look for files in: `admin/favicon/source-{timestamp}.png`
- If missing: Upload didn't reach Storage

### 2. Check Firestore Document
- Go to Firestore Console
- Look for: `siteConfig` > `favicon` document
- Should contain: version, files{}, generatedAt
- If missing: Cloud Function didn't run

### 3. Check Cloud Functions
```bash
# Deploy functions if not done yet
cd functions
npm install
cd ..
firebase deploy --only functions

# Check function logs
firebase functions:log --only generateFavicons
```

### 4. Manual Test
```bash
# Check if function exists
firebase functions:list

# Test with existing file
firebase functions:shell
# Then: generateFavicons({name: 'admin/favicon/source-test.png'})
```

### 5. Quick Fix - Manual Favicon Update
If functions aren't working, you can manually add to Firestore:

```javascript
// In Firebase Console > Firestore
// Create document: siteConfig/favicon
{
  version: "1728000000000",
  files: {
    "favicon.ico": "https://firebasestorage.googleapis.com/YOUR_URL/favicon.ico",
    "favicon-16x16.png": "https://firebasestorage.googleapis.com/YOUR_URL/favicon-16x16.png"
    // ... etc
  }
}
```

### 6. Browser Testing
- Open Developer Tools > Network tab
- Refresh page
- Look for favicon requests - are they 404 or loading?
- Check Console for favicon service logs

## Common Issues:

1. **Functions not deployed**: Run `firebase deploy --only functions`
2. **Storage rules**: Admin can upload to admin/favicon/*
3. **Missing packages**: Run `npm install` in functions folder
4. **File paths wrong**: Use Firebase Storage URLs, not local paths
5. **Caching**: Clear browser cache or use incognito mode