import fs from "fs";
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

// ✅ Use global fetch (no need for node-fetch in Node 18+)
const fetchFn = globalThis.fetch || (await import("node-fetch")).default;



interface ImagePart {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  position: number;
}

async function splitImageFromUrl(imageUrl: string) {
  try {
    console.log("📥 Fetching image...");
    const response = await fetchFn(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("✂️ Splitting and uploading image parts...");
    const parts: ImagePart[] = [
      { x: 0, y: 0, w: 400, h: 400, type: "pencil", position: 1 },
      { x: 400, y: 0, w: 400, h: 400, type: "shoe", position: 2 },
      { x: 0, y: 400, w: 400, h: 400, type: "book", position: 3 },
      { x: 400, y: 400, w: 400, h: 400, type: "dog", position: 4 },
    ];

    const croppedUrls: string[] = [];

    for (const part of parts) {
      try {
        const croppedBuffer = await sharp(buffer)
          .extract({ left: part.x, top: part.y, width: part.w, height: part.h })
          .png()
          .toBuffer();

        const uploadRes = await cloudinary.uploader.upload(
          `data:image/png;base64,${croppedBuffer.toString("base64")}`,
          { folder: "split_parts", public_id: part.type, resource_type: "image" }
        );

        croppedUrls.push(uploadRes.secure_url);
        console.log(`✅ Uploaded part ${part.position} (${part.type})`);
      } catch (uploadErr) {
        console.error(`❌ Error processing part ${part.position}:`, uploadErr);
      }
    }

    console.log("🔠 Running OCR on full image (hin+eng)...");
    const result: any = await Tesseract.recognize(buffer, "hin+eng");
    const text = result?.data?.text || "";

    const questions = text
      .split("\n")
      .map((q: string) => q.trim())
      .filter((q: string) => q.length > 0);

    console.log("\n🖼️ Cropped image URLs:");
    croppedUrls.forEach((u) => console.log(" -", u));

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

    // const cleanedQuestions = cleanQuestions(questions);
    // cleanedQuestions.forEach((q, i) => console.log(`${i + 1}. ${q}`));
  
    // questions.forEach((q: string, i: number) => console.log(`${i + 1}. ${q}`));

    return { croppedUrls, questions };
  } catch (err) {
    console.error("🚨 Error in splitImageFromUrl:", err);
  }
}

// 🚀 Run Example
(async () => {
  try {
    const imageUrl =
      "https://res.cloudinary.com/df1gfkrv7/image/upload/v1762619463/split-images/xi57tn5p6bri4ruaundu.jpg"; // replace with your image URL
    await splitImageFromUrl(imageUrl);
  } catch (err) {
    console.error("❌ Script failed:", err);
  }
})();
