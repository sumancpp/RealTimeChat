import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || null;

// Initialize the client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-1.5-flash";

// Helper function to pause execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateGeminiReply = async (prompt, model = GEMINI_MODEL, maxRetries = 3) => {
    const trimmedPrompt = prompt?.toString().trim();
    if (!trimmedPrompt) return "Sorry, I couldn't generate a response.";
    if (!GEMINI_API_KEY) return "AI replies use fallback text (Missing Key).";

    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: trimmedPrompt,
            });

            return response.text?.trim() || "Sorry, I couldn't generate a response.";

        } catch (error) {
            attempt++;
            
            // Check if the error is a Rate Limit / Resource Exhausted (429)
            const isRateLimit = error.status === 429 || 
                                error.message?.includes("429") || 
                                error.message?.includes("RESOURCE_EXHAUSTED");

            if (isRateLimit && attempt < maxRetries) {
                // Read wait time from API if available (e.g., 10s), otherwise fall back to exponential calculation
                // Your error log shows: "retryDelay":"10s", which translates to 10000ms
                const serverSuggests = error.details?.find(d => d['@type']?.includes('RetryInfo'))?.retryDelay;
                let waitTime = serverSuggests ? parseFloat(serverSuggests) * 1000 : Math.pow(2, attempt) * 1000;
                
                // Add a small random buffer (jitter) to prevent simultaneous retries if multiple requests hit at once
                waitTime += Math.random() * 1000;

                console.warn(`[Gemini API] 429 Rate Limit hit. Retrying attempt ${attempt}/${maxRetries} in ${waitTime.toFixed(0)}ms...`);
                
                await delay(waitTime);
                continue; // Loop back and try again
            }

            // If it's a different error (400, 403, etc.) or we ran out of retries, throw it
            console.error("Gemini SDK Permanent Error:", error);
            throw error;
        }
    }
};

export default generateGeminiReply;