import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || null;
if (!GEMINI_API_KEY) {
    console.warn(
        "Warning: GEMINI_API_KEY is not configured. AI replies will use fallback text until the key is provided."
    );
}

const GEMINI_MODEL = "gemini-2.5-flash";

const getFetch = () => {
    if (typeof fetch !== "undefined") {
        return fetch.bind(globalThis);
    }
    throw new Error(
        "Global fetch is unavailable. Please run the backend with Node 18+ or add a fetch polyfill."
    );
};

const generateGeminiReply = async (prompt, model = GEMINI_MODEL) => {
    const trimmedPrompt = prompt?.toString().trim();
    if (!trimmedPrompt) {
        return "Sorry, I couldn't generate a response.";
    }

    const body = {
        contents: [
            {
                parts: [
                    {
                        text: trimmedPrompt
                    }
                ]
            }
        ]
    };

    if (!GEMINI_API_KEY) {
        return "Sorry, I couldn't generate a response because the Gemini API key is not configured.";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const response = await getFetch()(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GEMINI_API_KEY
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
        const errorMessage = data?.error?.message || JSON.stringify(data);
        throw new Error(`Gemini API error ${response.status}: ${errorMessage}`);
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.map(
        (part) => part?.text || ""
    ).join("") || data?.candidates?.[0]?.content?.text || data?.text;

    return aiText?.trim() || "Sorry, I couldn't generate a response.";
};

export default generateGeminiReply;