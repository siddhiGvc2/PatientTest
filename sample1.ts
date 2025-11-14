/**
 * sample-enhance-then-crop.ts
 *
 * Requirements:
 *  - Node 18+ (for global fetch) or remove the fetch fallback.
 *  - npm i sharp tesseract.js openai cloudinary
 *  - set env vars: CLOUDINARY_* or edit config below, and OPENAI_API_KEY
 *
 * Run:
 *  npx ts-node sample-enhance-then-crop.ts
 */

import sharp from "sharp";
import Tesseract from "tesseract.js";
import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- OpenAI client (needs OPENAI_API_KEY in env) ---
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
const openai = new OpenAI({
  apiKey:process.env.OPENAI_API_KEY
});



// Fallback for fetch in older Node (attempt dynamic import if needed)
const fetchFn: typeof fetch =
  (globalThis as any).fetch ||
  (async (...args: any[]) => {
    const mod = await import("node-fetch");
    return (mod.default as any)(...args);
  }) as any;

interface ImagePart {
  left: number;
  top: number;
  width: number;
  height: number;
  type: string;
  position: number;
}

/**
 * Enhance the entire image buffer first, then return the enhanced buffer.
 * Uses modulate + linear + sharpen to simulate brightness/contrast and clarity.
 */
async function enhanceFullImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .modulate({ brightness: 1.12, saturation: 1.05 }) // brightness + slight saturation
    .linear(1.07, -6) // approximate contrast: (a * x + b)
    .sharpen()
    .toBuffer();
}

/**
 * Basic AI cleanup of OCR text using OpenAI (gives back numbered cleaned questions)
 */
async function enhanceQuestionsWithAI(questions: string[]): Promise<string[]> {
  const joinedQuestions = questions.join("\n");

  const prompt = `
You are a helpful assistant that cleans and formats OCR text into readable Hindi/English questions.

Input text (may contain noise):
${joinedQuestions}

Output the cleaned, well-formed list of questions in correct language (Hindi or English as detected):
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const aiOutput = response.choices[0].message.content || "";
  return aiOutput
    .split("\n")
    .map(q => q.trim())
    .filter(q => q.length > 0);
}

/**
 * Main pipeline:
 * 1) fetch image
 * 2) enhance full image
 * 3) compute dynamic parts (top region -> 2x2 grid, bottom -> text area)
 * 4) crop enhanced buffer for each part, upload to Cloudinary
 * 5) OCR bottom enhanced crop and clean with OpenAI
 */
async function processImageUrl(imageUrl: string) {
  try {
    console.log("📥 Fetching image:", imageUrl);
    const resp = await fetchFn(imageUrl);
    if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status} ${resp.statusText}`);
    const arrayBuffer = await resp.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    console.log("✨ Enhancing full image (this will be used as source for all crops)...");
    const enhancedFull = await enhanceFullImage(inputBuffer);

    // Get enhanced image metadata (width/height)
    const meta = await sharp(enhancedFull).metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;
    if (!width || !height) throw new Error("Could not determine image dimensions.");

    console.log(`📐 Enhanced image dimensions: ${width}x${height}`);

    // Decide layout:
    // - Top region: roughly top 70% (objects) -> split into 2x2 grid
    // - Bottom region: remaining ~30% for questions (you can tweak ratio)
    const topRatio = 0.70;
    const topHeight = Math.floor(height * topRatio);
    const bottomHeight = height - topHeight;
    const halfWidth = Math.floor(width / 2);
    const halfTopHeight = Math.floor(topHeight / 2);

    // build parts dynamically, based on actual size
    const objectParts: ImagePart[] = [
      { left: 0, top: 0, width: halfWidth, height: halfTopHeight, type: "obj_1", position: 1 },
      { left: halfWidth, top: 0, width: width - halfWidth, height: halfTopHeight, type: "obj_2", position: 2 },
      { left: 0, top: halfTopHeight, width: halfWidth, height: topHeight - halfTopHeight, type: "obj_3", position: 3 },
      { left: halfWidth, top: halfTopHeight, width: width - halfWidth, height: topHeight - halfTopHeight, type: "obj_4", position: 4 },
    ];

    // Crop each object from the ENHANCED full image and upload
    const uploadedImageUrls: string[] = [];
    for (const part of objectParts) {
      try {
        const cropBuf = await sharp(enhancedFull)
          .extract({ left: part.left, top: part.top, width: part.width, height: part.height })
          .resize({ width: Math.min(part.width, 1024) }) // optional resize for upload
          .png()
          .toBuffer();

        // Optional further local processing on each crop (if needed) could go here.

        const up = await cloudinary.uploader.upload(
          `data:image/png;base64,${cropBuf.toString("base64")}`,
          { folder: "split_parts_enhanced", public_id: `${part.type}_${Date.now()}`, resource_type: "image" }
        );
        uploadedImageUrls.push(up.secure_url);
        console.log(`✅ Uploaded part ${part.position} -> ${up.secure_url}`);
      } catch (err) {
        console.error(`❌ Error cropping/uploading part ${part.position}:`, err);
      }
    }

    // Crop bottom area from ENHANCED image for OCR (ensures OCR sees enhanced text)
    console.log("🔎 Preparing bottom region for OCR...");
    const bottomCropBuf = await sharp(enhancedFull)
      .extract({ left: 0, top: topHeight, width: width, height: bottomHeight })
      .resize({ width: Math.min(width, 1600) }) // resize for better OCR if huge
      .png()
      .toBuffer();

    // (Optional) upload bottom cropped image too (for debugging/preview)
    try {
      const upBottom = await cloudinary.uploader.upload(
        `data:image/png;base64,${bottomCropBuf.toString("base64")}`,
        { folder: "split_parts_enhanced", public_id: `bottom_${Date.now()}`, resource_type: "image" }
      );
      console.log("✅ Uploaded bottom enhanced crop:", upBottom.secure_url);
    } catch (err) {
      console.warn("⚠️ Failed to upload bottom crop (non-fatal):", err);
    }

    console.log("🔠 Running OCR on full image (hin+eng)...");
       const result: any = await Tesseract.recognize(inputBuffer, "hin+eng");
       const text = result?.data?.text || "";
   
       const questions = text
         .split("\n")
         .map((q: string) => q.trim())
         .filter((q: string) => q.length > 0);
   
       console.log("\n🖼️ Cropped image URLs:");
       uploadedImageUrls.forEach((u) => console.log(" -", u));
   
       console.log("\n📖 Extracted Questions:");
       function cleanQuestions(questions: string[]): string[] {
           return questions
               .map(q =>
               q
                   .replace(/[^\p{L}\p{N}\s?।?!]/gu, "") // remove symbols but keep Hindi/English chars
                   .replace(/\s+/g, " ") // normalize spaces
                   .trim()
               )
               .filter(q => q.length > 3); // remove too-short noise
           }
    
       const cleaned = await enhanceQuestionsWithAI(questions);
   
   // Remove duplicate numbering like "1. 1."
   const finalQuestions = cleaned.map(q => q.replace(/^\d+\.\s*/, '').trim());
   
   console.log("\n✨ Final Enhanced Questions:");
   finalQuestions.forEach((q, i) => console.log(`${i + 1}. ${q}`));

    return { uploadedImageUrls, finalQuestions };
  } catch (err) {
    console.error("🚨 Error in processImageUrl:", err);
    throw err;
  }
}

// Example run
(async () => {
  try {
    const imageUrl =
      "https://res.cloudinary.com/df1gfkrv7/image/upload/v1762619463/split-images/xi57tn5p6bri4ruaundu.jpg";
    await processImageUrl(imageUrl);
  } catch (err) {
    console.error("Script failed:", err);
  }
})();



export default processImageUrl;