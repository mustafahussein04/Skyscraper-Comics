import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative, extname } from "path";

const BUCKET = "skyscrapercomics-frontend";
const DIST = "./frontend/dist";
const REGION = "us-west-1";

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
};

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const files = walk(DIST);
console.log(`Uploading ${files.length} files to s3://${BUCKET}...`);

let done = 0;
for (const file of files) {
  const key = relative(DIST, file).replace(/\\/g, "/");
  const ext = extname(file).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const body = readFileSync(file);

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  done++;
  if (done % 10 === 0 || done === files.length) {
    process.stdout.write(`\r${done}/${files.length}`);
  }
}

console.log("\nDone!");
