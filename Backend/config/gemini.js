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
const GEMINI_MODEL = "gemini-2.5-flash";

// Helper function to pause execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Parse retry delay values like "59s", "10000ms", or an object { seconds, nanos }
const parseRetryDelayMs = (retryInfo) => {
    if (!retryInfo) return null;

    // If it's an object with seconds/nanos
    if (typeof retryInfo === "object") {
        const seconds = Number(retryInfo.seconds ?? retryInfo.seconds?.value ?? 0);
        const nanos = Number(retryInfo.nanos ?? 0);
        return Math.round(seconds * 1000 + nanos / 1e6);
    }

    // If it's a string like "59s" or "10000ms"
    if (typeof retryInfo === "string") {
        const sMatch = retryInfo.match(/([0-9.]+)s$/);
        if (sMatch) return Math.round(parseFloat(sMatch[1]) * 1000);
        const msMatch = retryInfo.match(/([0-9.]+)ms$/);
        if (msMatch) return Math.round(parseFloat(msMatch[1]));
        const num = parseFloat(retryInfo);
        if (!Number.isNaN(num)) return Math.round(num * 1000);
    }

    return null;
};

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
                config: {
                    systemInstruction: "You are BaatCheet AI, a helpful chat assistant. Keep your responses extremely concise, conversational, and very short (maximum 1-2 sentences). Do not give long explanations.",
                }
            });

            return response.text?.trim() || "Sorry, I couldn't generate a response.";

        } catch (error) {
            attempt++;
            
            // Check if the error is a Rate Limit / Resource Exhausted (429)
            const isRateLimit = error.status === 429 || 
                                error.message?.includes("429") || 
                                error.message?.includes("RESOURCE_EXHAUSTED");

            if (isRateLimit && attempt < maxRetries) {
                // Find any RetryInfo detail provided by the API
                const retryDetail = Array.isArray(error.details)
                    ? error.details.find((d) => String(d['@type'] || '').includes('RetryInfo'))?.retryDelay
                    : error.retryDelay || null;

                // Parse server-suggested delay (supports strings like "59s", "10000ms" or objects)
                let waitTime = parseRetryDelayMs(retryDetail) ?? Math.pow(2, attempt) * 1000;

                // Add jitter
                waitTime += Math.round(Math.random() * 1000);

                console.warn(`[Gemini API] Rate limit hit. Retrying ${attempt}/${maxRetries} in ${waitTime}ms`);
                await delay(waitTime);
                continue; // Loop back and try again
            }

            // If this is a resource exhausted / quota error, return a friendly fallback message
            const isQuotaExceeded = String(error.message || '').includes('Quota') || String(error.message || '').includes('quota') ||
                String(error.message || '').includes('RESOURCE_EXHAUSTED');

            if (isQuotaExceeded) {
                console.error('[Gemini API] Quota exceeded or resource exhausted:', error.message || error);
                return 'AI temporarily unavailable: quota or billing limits reached. Please try again later.';
            }

            // Otherwise log and rethrow so upstream can decide how to handle it
            console.error('Gemini SDK Permanent Error:', error);
            throw error;
        }
    }
};

export default generateGeminiReply;