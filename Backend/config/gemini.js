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
        currentKeyIndex = (currentKeyIndex + 1) % keyPool.length;
        if (now > keyPool[currentKeyIndex].exhaustedUntil) {
            return keyPool[currentKeyIndex].client;
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

export const GEMINI_MODEL = "gemini-1.5-flash";

// Helper function to pause execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// AI Usage & Token Metrics Tracker
let lastResetDate = new Date().toDateString();
let dailyRequestsToday = 0;
let dailyTokensToday = 0;
const aiUsersToday = new Set();

const checkDailyReset = () => {
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
        lastResetDate = today;
        dailyRequestsToday = 0;
        dailyTokensToday = 0;
        aiUsersToday.clear();
        console.log(`[AI Tracker] Reset daily AI counters for ${today}`);
    }
};

export const getAIMetrics = () => {
    checkDailyReset();
    const totalCapacity = Math.max(1, keyPool.length) * 1500;
    const remainingRequests = Math.max(0, totalCapacity - dailyRequestsToday);
    return {
        date: lastResetDate,
        activeKeys: keyPool.length,
        dailyLimitRPD: totalCapacity,
        requestsUsedToday: dailyRequestsToday,
        requestsRemainingToday: remainingRequests,
        tokensUsedTodayEst: dailyTokensToday,
        uniqueUsersToday: aiUsersToday.size
    };
};

export const logAIUsage = (featureName = "AI Feature", userId = "Anonymous", promptText = "", responseText = "") => {
    checkDailyReset();
    dailyRequestsToday += 1;
    if (userId && userId !== "Anonymous") aiUsersToday.add(userId.toString());

    // Approximate token count (~4 characters per token)
    const promptTokens = Math.ceil((promptText?.length || 0) / 4);
    const responseTokens = Math.ceil((responseText?.length || 0) / 4);
    const tokensUsed = promptTokens + responseTokens;
    dailyTokensToday += tokensUsed;

    const totalCapacity = Math.max(1, keyPool.length) * 1500;
    const remainingRequests = Math.max(0, totalCapacity - dailyRequestsToday);

    console.log(`
============================================================
🤖 [BaatCheet AI Metrics Logger]
------------------------------------------------------------
✦ Feature Used     : ${featureName}
✦ User ID          : ${userId}
✦ API Keys Pool    : ${keyPool.length} Active Key(s)
✦ Requests Today   : ${dailyRequestsToday} / ${totalCapacity} RPD
✦ Requests LEFT    : ${remainingRequests} RPD
✦ Tokens This Call : ~${tokensUsed} Tokens
✦ Tokens Today (Est): ~${dailyTokensToday} Tokens
✦ Unique AI Users  : ${aiUsersToday.size} User(s) Today
============================================================
`);
};

// Parse retry delay values like "59s", "10000ms", or an object { seconds, nanos }
const parseRetryDelayMs = (retryInfo) => {
    if (!retryInfo) return null;

    if (typeof retryInfo === "object") {
        const seconds = Number(retryInfo.seconds ?? retryInfo.seconds?.value ?? 0);
        const nanos = Number(retryInfo.nanos ?? 0);
        return Math.round(seconds * 1000 + nanos / 1e6);
    }

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

const generateGeminiReply = async (prompt, model = GEMINI_MODEL, maxRetries = 5, customSystemInstruction = null, featureName = "AI Request", userId = "Anonymous") => {
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

            const textOutput = response.text?.trim() || "Sorry, I couldn't generate a response.";
            logAIUsage(featureName, userId, trimmedPrompt, textOutput);
            return textOutput;

        } catch (error) {
            attempt++;
            
            const isQuotaExceeded = String(error.message || '').includes('Quota') || String(error.message || '').includes('quota') ||
                String(error.message || '').includes('RESOURCE_EXHAUSTED') || error.status === 429 || error.message?.includes("429");

            if (isQuotaExceeded) {
                let waitTime = 10000;
                const messageStr = String(error.message || '');
                
                const retryMatch = messageStr.match(/retry in ([0-9.]+)s/i);
                if (retryMatch) {
                    waitTime = Math.round(parseFloat(retryMatch[1]) * 1000);
                } else {
                    try {
                        const errorJsonMatch = messageStr.match(/\{"error":.*\}/);
                        if (errorJsonMatch) {
                            const parsed = JSON.parse(errorJsonMatch[0]);
                            if (parsed.error && Array.isArray(parsed.error.details)) {
                                const retryInfo = parsed.error.details.find((d) => String(d['@type'] || '').includes('RetryInfo'));
                                if (retryInfo && retryInfo.retryDelay) {
                                    waitTime = parseRetryDelayMs(retryInfo.retryDelay) ?? 10000;
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