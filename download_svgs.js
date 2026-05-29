const fs = require('fs');
const path = require('path');
const https = require('https');

const csvPath = path.join(__dirname, 'Data_summary.csv');
const destDir = path.join(__dirname, 'public', 'package_signs');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

// Parse labels (skip header)
const labels = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = line.split(',');
  const label = parts[0].trim();
  if (label && label !== 'other-sign' && label !== 'labels') {
    labels.push(label);
  }
}

console.log(`[+] Found ${labels.length} labels to download.`);

async function downloadFile(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
      } else {
        resolve(false); // e.g. 404 or other errors
      }
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Download with concurrency limit of 10
async function run() {
  const batchSize = 15;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < labels.length; i += batchSize) {
    const batch = labels.slice(i, i + batchSize);
    console.log(`[+] Downloading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(labels.length / batchSize)}...`);
    
    await Promise.all(batch.map(async (label) => {
      const url = `https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/master/package_signs/${label}.svg`;
      const dest = path.join(destDir, `${label}.svg`);
      
      const success = await downloadFile(url, dest);
      if (success) {
        successCount++;
      } else {
        failCount++;
        // Remove empty file if created
        if (fs.existsSync(dest) && fs.statSync(dest).size === 0) {
          fs.unlinkSync(dest);
        }
      }
    }));
  }

  console.log(`[+] Done! Successfully downloaded: ${successCount}. Failed/Not found: ${failCount}.`);
}

run();
