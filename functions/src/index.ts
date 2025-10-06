import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

admin.initializeApp();
const storage = admin.storage();
const db = admin.firestore();

export const generateFavicons = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name || '';
  
  // Only process favicon files uploaded to siteImages/
  if (!filePath.startsWith('siteImages/favicon_')) {
    console.log('Not a favicon file, skipping');
    return;
  }

  const bucket = storage.bucket(object.bucket);
  const contentType = object.contentType;

  // Only process images
  if (!contentType || !contentType.startsWith('image/')) {
    console.log('Not an image file, skipping');
    return;
  }

  console.log('Processing favicon:', filePath);

  try {
    // Download the uploaded file
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    await bucket.file(filePath).download({ destination: tempFilePath });

    // Create working directory
    const workDir = path.join(os.tmpdir(), 'favicon-processing');
    await fs.mkdir(workDir, { recursive: true });

    // Ensure the image is square and create a base 1024x1024 PNG
    const baseImage = sharp(tempFilePath)
      .resize(1024, 1024, { fit: 'cover', position: 'center' })
      .png();

    const basePath = path.join(workDir, 'base-1024.png');
    await baseImage.toFile(basePath);

    // Generate all required sizes
    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
    ];

    const generatedFiles: string[] = [];

    // Generate PNG files
    for (const sizeConfig of sizes) {
      const outputPath = path.join(workDir, sizeConfig.name);
      await sharp(basePath)
        .resize(sizeConfig.size, sizeConfig.size)
        .png()
        .toFile(outputPath);
      generatedFiles.push(outputPath);
    }

    // Generate ICO file (combine 16x16 and 32x32)
    const ico16Path = path.join(workDir, 'favicon-16x16.png');
    const ico32Path = path.join(workDir, 'favicon-32x32.png');
    const icoBuffer = await pngToIco([ico16Path, ico32Path]);
    const icoPath = path.join(workDir, 'favicon.ico');
    await fs.writeFile(icoPath, icoBuffer);
    generatedFiles.push(icoPath);

    // Upload all generated files to public/favicon/ AND to the hosting public directory
    const uploadPromises = generatedFiles.map(async (filePath) => {
      const fileName = path.basename(filePath);
      
      // Upload to storage for admin access
      const storageDestination = `public/favicon/${fileName}`;
      await bucket.upload(filePath, {
        destination: storageDestination,
        metadata: {
          contentType: fileName.endsWith('.ico') ? 'image/x-icon' : 'image/png',
          cacheControl: 'public, max-age=31536000, immutable'
        }
      });
      
      console.log(`Uploaded to storage: ${storageDestination}`);
    });

    await Promise.all(uploadPromises);

    // Generate version timestamp for cache busting
    const version = Date.now().toString();

    // Get download URLs for the uploaded files
    const getDownloadURL = async (fileName: string) => {
      const file = bucket.file(`public/favicon/${fileName}`);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future expiry for public files
      });
      return url;
    };

    // Find the corresponding document in siteImages collection by filename pattern
    const sourceFileName = path.basename(filePath);
    console.log('Looking for siteImages document with source file:', sourceFileName);
    
    const imagesSnapshot = await db.collection('siteImages')
      .where('type', '==', 'favicon')
      .where('status', '==', 'processing')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    let imageDoc = null;
    
    // Find the document that matches our timestamp from the filename
    const timestampMatch = sourceFileName.match(/favicon_(\d+)/);
    if (timestampMatch) {
      const fileTimestamp = timestampMatch[1];
      console.log('Extracted timestamp from filename:', fileTimestamp);
      
      for (const doc of imagesSnapshot.docs) {
        const docData = doc.data();
        // Check if the URL contains the timestamp
        if (docData.url && docData.url.includes(fileTimestamp)) {
          imageDoc = doc;
          console.log('Found matching document by timestamp in URL');
          break;
        }
      }
    }
    
    // Fallback: just take the most recent processing favicon document
    if (!imageDoc && !imagesSnapshot.empty) {
      imageDoc = imagesSnapshot.docs[0];
      console.log('Using most recent processing favicon document as fallback');
    }

    if (imageDoc) {
      // Update the favicon document with generated files info
      await imageDoc.ref.update({
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed',
        generatedFiles: {
          'favicon.ico': await getDownloadURL('favicon.ico'),
          'favicon-16x16.png': await getDownloadURL('favicon-16x16.png'),
          'favicon-32x32.png': await getDownloadURL('favicon-32x32.png'),
          'apple-touch-icon.png': await getDownloadURL('apple-touch-icon.png'),
          'android-chrome-192x192.png': await getDownloadURL('android-chrome-192x192.png'),
          'android-chrome-512x512.png': await getDownloadURL('android-chrome-512x512.png')
        }
      });

      console.log('Updated siteImages document with generated files');
    } else {
      console.warn('Could not find matching siteImages document');
      
      // Create a fallback document if none found
      await db.collection('siteImages').add({
        filename: path.basename(filePath),
        size: object.size || 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        url: await bucket.file(filePath).getSignedUrl({
          action: 'read',
          expires: '03-01-2500'
        }),
        sourceUrl: await bucket.file(filePath).getSignedUrl({
          action: 'read',
          expires: '03-01-2500'
        }),
        isActive: false,
        type: 'favicon',
        status: 'completed',
        generatedFiles: {
          'favicon.ico': await getDownloadURL('favicon.ico'),
          'favicon-16x16.png': await getDownloadURL('favicon-16x16.png'),
          'favicon-32x32.png': await getDownloadURL('favicon-32x32.png'),
          'apple-touch-icon.png': await getDownloadURL('apple-touch-icon.png'),
          'android-chrome-192x192.png': await getDownloadURL('android-chrome-192x192.png'),
          'android-chrome-512x512.png': await getDownloadURL('android-chrome-512x512.png')
        }
      });
      
      console.log('Created fallback siteImages document');
    }

    // Clean up temporary files
    await fs.rm(tempFilePath, { force: true });
    await fs.rm(workDir, { recursive: true, force: true });

    console.log('Favicon generation completed successfully');

  } catch (error) {
    console.error('Error generating favicons:', error);
    throw error;
  }
});

// Optional: Clean up old favicon versions
export const cleanupOldFavicons = functions.pubsub.schedule('0 2 * * 0') // Weekly on Sunday at 2 AM
  .onRun(async () => {
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: 'admin/favicon/' });
      
      // Keep only the 5 most recent favicon source files
      const sourceFiles = files
        .filter(file => file.name.includes('source-'))
        .sort((a, b) => (b.metadata.timeCreated || '').localeCompare(a.metadata.timeCreated || ''));
      
      if (sourceFiles.length > 5) {
        const filesToDelete = sourceFiles.slice(5);
        const deletePromises = filesToDelete.map(file => file.delete());
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${filesToDelete.length} old favicon source files`);
      }
    } catch (error) {
      console.error('Error cleaning up old favicons:', error);
    }
  });