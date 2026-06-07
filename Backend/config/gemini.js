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

const generateGeminiReply = async (prompt, model = GEMINI_MODEL) => {
    const trimmedPrompt = prompt?.toString().trim();
    if (!trimmedPrompt) return "Sorry, I couldn't generate a response.";
    if (!GEMINI_API_KEY) return "AI replies use fallback text (Missing Key).";

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: trimmedPrompt,
        });

        return response.text?.trim() || "Sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini SDK Error:", error);
        // You can still inspect error.status here to implement a retry loop if needed!
        throw error;
    }
};

export default generateGeminiReply;