import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const keys = [];
if (process.env.GEMINI_API_KEY?.trim()) keys.push(process.env.GEMINI_API_KEY.trim());
for (let i = 2; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`]?.trim();
    if (key) keys.push(key);
}

const keyPool = keys.map(key => ({
    key,
    client: new GoogleGenAI({ apiKey: key }),
    exhaustedUntil: 0 // Timestamp when rate limit expires
}));

let currentKeyIndex = 0;

const getAvailableClient = () => {
    if (keyPool.length === 0) return null;
    
    const now = Date.now();
    for (let i = 0; i < keyPool.length; i++) {
        const index = (currentKeyIndex + i) % keyPool.length;
        if (now > keyPool[index].exhaustedUntil) {
            currentKeyIndex = index;
            return keyPool[index].client;
        }
    }
    
    let bestIndex = 0;
    let minWait = Infinity;
    for (let i = 0; i < keyPool.length; i++) {
        if (keyPool[i].exhaustedUntil < minWait) {
            minWait = keyPool[i].exhaustedUntil;
            bestIndex = i;
        }
    }
    currentKeyIndex = bestIndex;
    return keyPool[bestIndex].client;
};

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

const generateGeminiReply = async (prompt, model = GEMINI_MODEL, maxRetries = 5, customSystemInstruction = null) => {
    const trimmedPrompt = prompt?.toString().trim();
    if (!trimmedPrompt) return "Sorry, I couldn't generate a response.";
    if (keyPool.length === 0) return "AI replies use fallback text (Missing Key).";

    let attempt = 0;

    while (attempt < maxRetries) {
        const activeClient = getAvailableClient();
        const activeKeyIndex = currentKeyIndex;
        
        try {
            const response = await activeClient.models.generateContent({
                model: model,
                contents: trimmedPrompt,
                config: {
                    systemInstruction: customSystemInstruction || "You are BaatCheet AI, a helpful chat assistant. Keep your responses extremely concise, conversational, and very short (maximum 1-2 sentences). Do not give long explanations.",
                }
            });

            return response.text?.trim() || "Sorry, I couldn't generate a response.";

        } catch (error) {
            attempt++;
            
            const isQuotaExceeded = String(error.message || '').includes('Quota') || String(error.message || '').includes('quota') ||
                String(error.message || '').includes('RESOURCE_EXHAUSTED') || error.status === 429 || error.message?.includes("429");

            if (isQuotaExceeded) {
                let waitTime = 60000;
                const messageStr = String(error.message || '');
                
                // First try to extract from human readable message
                const retryMatch = messageStr.match(/retry in ([0-9.]+)s/i);
                if (retryMatch) {
                    waitTime = Math.round(parseFloat(retryMatch[1]) * 1000);
                } else {
                    // Then try to extract from JSON details dumped in the error message
                    try {
                        const errorJsonMatch = messageStr.match(/\{"error":.*\}/);
                        if (errorJsonMatch) {
                            const parsed = JSON.parse(errorJsonMatch[0]);
                            if (parsed.error && Array.isArray(parsed.error.details)) {
                                const retryInfo = parsed.error.details.find((d) => String(d['@type'] || '').includes('RetryInfo'));
                                if (retryInfo && retryInfo.retryDelay) {
                                    waitTime = parseRetryDelayMs(retryInfo.retryDelay) ?? 60000;
                                }
                            }
                        }
                    } catch(e) {}
                }
                
                keyPool[activeKeyIndex].exhaustedUntil = Date.now() + waitTime;
                console.warn(`[Gemini API] Key ${activeKeyIndex + 1} exhausted. Cooldown: ${waitTime}ms`);

                if (attempt < maxRetries) {
                    let nextKey = null;
                    let minWait = Infinity;
                    const now = Date.now();
                    
                    for (const k of keyPool) {
                        if (now > k.exhaustedUntil) {
                            nextKey = k;
                            break;
                        }
                        if (k.exhaustedUntil - now < minWait) {
                            minWait = k.exhaustedUntil - now;
                        }
                    }
                    
                    if (!nextKey && minWait > 0 && minWait < 120000) {
                        console.warn(`[Gemini API] All keys exhausted. Waiting ${minWait}ms before next attempt.`);
                        await delay(minWait + 1000); 
                    } else if (!nextKey) {
                        break; 
                    }
                    
                    continue; 
                }

                console.error('[Gemini API] Quota exceeded on all available keys:', error.message || error);
                return 'AI temporarily unavailable: quota or billing limits reached. Please try again later.';
            }

            console.error('Gemini SDK Permanent Error:', error);
            throw error;
        }
    }
};

export default generateGeminiReply;