const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'public', 'images');
const MAX_WIDTH = 1920; // Max width for any image
const QUALITY = 80; // JPEG quality (80 = good balance of quality/size)
const MIN_SIZE_KB = 500; // Only compress files larger than 500KB

async function compressImages() {
  const files = fs.readdirSync(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  console.log(`\n📸 Found ${imageFiles.length} images in /public/images/\n`);
  console.log('─'.repeat(70));
  
  let totalBefore = 0;
  let totalAfter = 0;
  let compressedCount = 0;

  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    const stats = fs.statSync(filePath);
    const sizeKB = stats.size / 1024;
    
    if (sizeKB < MIN_SIZE_KB) {
      console.log(`⏭️  ${file.padEnd(30)} ${(sizeKB).toFixed(0).padStart(6)} KB — skipped (< ${MIN_SIZE_KB}KB)`);
      totalBefore += stats.size;
      totalAfter += stats.size;
      continue;
    }

    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      // Create temp path
      const tempPath = filePath + '.tmp';
      
      let pipeline = sharp(filePath);
      
      // Resize if wider than MAX_WIDTH (keep aspect ratio)
      if (metadata.width && metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }
      
      // Compress based on format
      const ext = path.extname(file).toLowerCase();
      if (ext === '.png') {
        pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
      } else {
        pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
      }
      
      await pipeline.toFile(tempPath);
      
      const newStats = fs.statSync(tempPath);
      const newSizeKB = newStats.size / 1024;
      const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);
      
      // Only replace if actually smaller
      if (newStats.size < stats.size) {
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        console.log(`✅ ${file.padEnd(30)} ${sizeKB.toFixed(0).padStart(6)} KB → ${newSizeKB.toFixed(0).padStart(6)} KB  (−${savings}%)`);
        totalBefore += stats.size;
        totalAfter += newStats.size;
        compressedCount++;
      } else {
        fs.unlinkSync(tempPath);
        console.log(`⏭️  ${file.padEnd(30)} ${sizeKB.toFixed(0).padStart(6)} KB — already optimized`);
        totalBefore += stats.size;
        totalAfter += stats.size;
      }
    } catch (err) {
      console.log(`❌ ${file.padEnd(30)} — Error: ${err.message}`);
      totalBefore += stats.size;
      totalAfter += stats.size;
    }
  }

  console.log('─'.repeat(70));
  console.log(`\n📊 Results:`);
  console.log(`   Files compressed: ${compressedCount}/${imageFiles.length}`);
  console.log(`   Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   After:  ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Saved:  ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)\n`);
}

compressImages().catch(console.error);
