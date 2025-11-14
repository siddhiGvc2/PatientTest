/**
 * sample-enhance-upload.ts
 *
 * - Enhances the input image using Sharp (brightness/contrast/saturation)
 * - Uploads 4 enhanced versions to Cloudinary
 *
 * Run:
 *   npx ts-node sample-enhance-upload.ts
 */

import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// --- Fallback fetch (for older Node) ---
const fetchFn: typeof fetch =
  (globalThis as any).fetch ||
  (async (...args: any[]) => {
    const mod = await import("node-fetch");
    return (mod.default as any)(...args);
  }) as any;

/**
 * Enhance image buffer with adjustable parameters
 */
async function enhanceFullImage(buffer: Buffer, level: number): Promise<Buffer> {
  // Different enhancement intensities based on level
  const settings = [
    { brightness: 1.05, saturation: 1.02, contrast: 1.05 },
    { brightness: 1.1, saturation: 1.04, contrast: 1.07 },
    { brightness: 1.12, saturation: 1.05, contrast: 1.1 },
    { brightness: 1.15, saturation: 1.08, contrast: 1.12 },
  ][level - 1];

  return await sharp(buffer)
    .modulate({ brightness: settings.brightness, saturation: settings.saturation })
    .linear(settings.contrast, -6) // simulate contrast
    .sharpen()
    .png()
    .toBuffer();
}

/**
 * Main: Enhance & upload 4 versions
 */
async function processAndUpload(imageUrl: string) {
  try {
    console.log("📥 Fetching image:", imageUrl);
    const resp = await fetchFn(imageUrl);
    if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.statusText}`);
    const arrayBuffer = await resp.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    console.log("✨ Enhancing and uploading images...");
    const uploadUrls: string[] = [];

    for (let i = 1; i <= 4; i++) {
      console.log(`🪄 Enhancing version ${i}...`);
      const enhancedBuffer = await enhanceFullImage(inputBuffer, i);

      const uploaded = await cloudinary.uploader.upload(
        `data:image/png;base64,${enhancedBuffer.toString("base64")}`,
        {
          folder: "enhanced_uploads",
          public_id: `enhanced_v${i}_${Date.now()}`,
          resource_type: "image",
        }
      );

      uploadUrls.push(uploaded.secure_url);
      console.log(`✅ Uploaded v${i}: ${uploaded.secure_url}`);
    }

    console.log("\n=== ALL ENHANCED IMAGE URLs ===");
    uploadUrls.forEach((u) => console.log(" -", u));
  } catch (err) {
    console.error("🚨 Error:", err);
  }
}

// Example run
(async () => {
  const imageUrl =
    "https://res.cloudinary.com/df1gfkrv7/image/upload/v1762619463/split-images/xi57tn5p6bri4ruaundu.jpg";
  await processAndUpload(imageUrl);
})();
