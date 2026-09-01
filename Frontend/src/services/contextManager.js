/**
 * Context Manager for BaatCheet AI
 * 
 * Manages message roles (system, user, assistant), context window budgeting,
 * memory injection, and deterministic truncation for on-device LLMs.
 */

import { localMemoryStore } from "./localMemoryStore.js";

const MAX_CONTEXT_TOKENS = 1500; // Safe budget for Qwen2.5-0.5B on client WebAssembly

export class ContextManager {
    /**
     * Approximate token estimation (1 token ~= 4 characters for English)
     */
    static estimateTokens(text) {
        if (!text) return 0;
        return Math.ceil(text.length / 4);
    }

    /**
     * Build formatted conversation context for the neural model
     */
    static buildContext(prompt, history = []) {
        const relevantMemories = localMemoryStore.getAll();
        const memoryKeys = Object.keys(relevantMemories);
        
        let memoryPromptSection = "";
        if (memoryKeys.length > 0) {
            const memoryList = memoryKeys.map(k => `${k}: ${relevantMemories[k].value}`).join("; ");
            memoryPromptSection = `\n[User Long-Term Memory Profile]: ${memoryList}`;
        }

        const systemMessage = {
            role: "system",
            content: `You are BaatCheet AI, an intelligent, concise, and truthful assistant running locally on the user's device.
- Answer user queries directly, clearly, and accurately.
- Do NOT invent or hallucinate facts, conversation history, or user statements.
- If information was not provided in the conversation, truthfully say you do not know.
- You are running on-device; if offline, you cannot access live real-time internet information.${memoryPromptSection}`
        };

        const formattedMessages = [systemMessage];
        let currentTokens = this.estimateTokens(systemMessage.content) + this.estimateTokens(prompt);

        // Process recent history in reverse (most recent first) to fit within token budget
        const recentHistory = (history || []).slice(-10);
        const historyToAdd = [];

        for (let i = recentHistory.length - 1; i >= 0; i--) {
            const msg = recentHistory[i];
            const content = (msg.message || "").trim();
            if (!content) continue;

            const role = (msg.sender?.isAI || msg.isAIMessage) ? "assistant" : "user";
            const tokens = this.estimateTokens(content);

            if (currentTokens + tokens > MAX_CONTEXT_TOKENS) {
                break; // Context window limit reached
            }

            currentTokens += tokens;
            historyToAdd.unshift({ role, content });
        }

        formattedMessages.push(...historyToAdd);
        formattedMessages.push({ role: "user", content: prompt.trim() });

        return {
            messages: formattedMessages,
            totalEstimatedTokens: currentTokens,
            historyCount: historyToAdd.length,
            memoryCount: memoryKeys.length
        };
    }
}

export default ContextManager;
