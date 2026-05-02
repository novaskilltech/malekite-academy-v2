
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "VAIzaSyDxKs-cDAmrkAbFhflSXF3Kx22cUHh1lh8"; // With V
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success:", result.response.text());
  } catch (e: any) {
    console.error("Error with V:", e.message);
    
    // Try without V
    const apiKeyNoV = apiKey.substring(1);
    console.log("Testing without V:", apiKeyNoV);
    const genAINoV = new GoogleGenerativeAI(apiKeyNoV);
    try {
      const modelNoV = genAINoV.getGenerativeModel({ model: "gemini-1.5-flash" });
      const resultNoV = await modelNoV.generateContent("Hello");
      console.log("Success without V:", resultNoV.response.text());
    } catch (e2: any) {
      console.error("Error without V:", e2.message);
    }
  }
}

test();
