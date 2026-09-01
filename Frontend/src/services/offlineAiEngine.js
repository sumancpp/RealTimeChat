/**
 * Offline AI Engine for BaatCheet AI
 * 
 * Coordinates:
 * 1. Persistent Local Long-Term Memory (localMemoryStore)
 * 2. Deterministic Local AI Tools (localAiTools)
 * 3. Context Window Manager (ContextManager)
 * 4. Dedicated Neural Background Web Worker (Qwen2.5-0.5B-Instruct)
 * 5. Diagnostic State Tracking for Developer Mode
 */

import { localMemoryStore } from "./localMemoryStore.js";
import { localAiTools } from "./localAiTools.js";
import { ContextManager } from "./contextManager.js";

export const isOnline = () => {
    return typeof navigator !== "undefined" && navigator.onLine;
};

// Diagnostic State Store
export const diagnosticState = {
    modelName: "onnx-community/Qwen2.5-0.5B-Instruct-q4",
    backend: "WASM / WebGPU (Browser Worker)",
    isModelLoaded: false,
    lastGenerationTimeMs: 0,
    lastToolUsed: "none",
    contextLengthTokens: 0,
    activeMemoriesCount: 0,
    status: "ready"
};

// Web Worker instance & pending request queue
let aiWorker = null;
let isWorkerInitializing = false;
let workerReady = false;
const pendingCallbacks = new Map();
let requestIdCounter = 0;

/**
 * Get or initialize the background Web Worker
 */
const getAIWorker = () => {
    if (aiWorker) return aiWorker;
    if (typeof window === "undefined" || typeof Worker === "undefined") return null;

    try {
        aiWorker = new Worker(new URL("./ai.worker.js", import.meta.url), { type: "module" });

        aiWorker.onmessage = (event) => {
            const { type, id, text, error, progress, durationMs, device, model } = event.data || {};

            if (type === "init_progress") {
                if (progress?.status === "progress" && progress.total) {
                    const pct = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`[BaatCheet AI Worker] Downloading offline model: ${pct}%`);
                }
            } else if (type === "init_done") {
                isWorkerInitializing = false;
                workerReady = true;
                diagnosticState.isModelLoaded = true;
                if (device) diagnosticState.backend = device.toUpperCase();
                if (model) diagnosticState.modelName = model;
                console.log("[BaatCheet AI Worker] Offline neural engine initialized!");
            } else if (type === "generate_done") {
                if (durationMs) diagnosticState.lastGenerationTimeMs = durationMs;
                if (device) diagnosticState.backend = device.toUpperCase();
                if (pendingCallbacks.has(id)) {
                    const { resolve } = pendingCallbacks.get(id);
                    pendingCallbacks.delete(id);
                    resolve(text);
                }
            } else if (type === "generate_error") {
                if (pendingCallbacks.has(id)) {
                    const { reject } = pendingCallbacks.get(id);
                    pendingCallbacks.delete(id);
                    reject(new Error(error || "Worker inference error"));
                }
            }
        };

        aiWorker.onerror = (err) => {
            console.warn("[BaatCheet AI Worker] Worker thread notice:", err);
        };

        return aiWorker;
    } catch (e) {
        console.warn("[BaatCheet AI Worker] Web Worker creation failed:", e);
    }
    return null;
};

/**
 * Pre-initialize Web Worker when online or on demand
 */
export const initOfflineLLM = async (onProgress) => {
    const worker = getAIWorker();
    if (!worker || workerReady) return true;
    if (isWorkerInitializing) return false;

    isWorkerInitializing = true;
    worker.postMessage({ type: "init" });
    return true;
};

// Start background download & initialization in Web Worker when online
if (typeof window !== "undefined") {
    setTimeout(() => {
        if (navigator.onLine) {
            initOfflineLLM().catch(() => {});
        }
    }, 1500);
}

// Chrome Prompt API (Gemini Nano on-device if available)
const queryChromePromptAPI = async (prompt) => {
    try {
        if (typeof window !== "undefined" && window.ai?.languageModel) {
            const session = await window.ai.languageModel.create({
                systemPrompt: "You are BaatCheet AI, an intelligent, helpful, and concise assistant."
            });
            const response = await session.prompt(prompt);
            session.destroy();
            if (response && response.trim()) return response.trim();
        }
    } catch (e) {}
    return null;
};

/**
 * Main Inference Pipeline for BaatCheet AI Offline
 */
export const generateOfflineAiReply = async (prompt, history = []) => {
    const userPrompt = (prompt || "").trim();
    if (!userPrompt) return "Hello! How can I help you today?";

    diagnosticState.status = "processing";

    // 1. Check Persistent Long-Term Memory Commands
    const memoryResult = localMemoryStore.handleMemoryCommand(userPrompt);
    if (memoryResult.handled) {
        diagnosticState.lastToolUsed = "local_memory_store";
        diagnosticState.activeMemoriesCount = Object.keys(localMemoryStore.getAll()).length;
        diagnosticState.status = "ready";
        return memoryResult.reply;
    }

    // 2. Check Local AI Tools (Exact calculations, logic syllogisms, RAM/Storage, device time, offline status, hallucination guard, summarization)
    const dateTimeResult = localAiTools.evaluateDateTime(userPrompt);
    if (dateTimeResult.handled) {
        diagnosticState.lastToolUsed = dateTimeResult.tool;
        diagnosticState.status = "ready";
        return dateTimeResult.reply;
    }

    const transparencyResult = localAiTools.evaluateOfflineTransparency(userPrompt);
    if (transparencyResult.handled) {
        diagnosticState.lastToolUsed = transparencyResult.tool;
        diagnosticState.status = "ready";
        return transparencyResult.reply;
    }

    const hallucinationGuardResult = localAiTools.evaluateHallucinationGuard(userPrompt, history);
    if (hallucinationGuardResult.handled) {
        diagnosticState.lastToolUsed = hallucinationGuardResult.tool;
        diagnosticState.status = "ready";
        return hallucinationGuardResult.reply;
    }

    const summarizationResult = localAiTools.evaluateSummarization(userPrompt, history);
    if (summarizationResult.handled) {
        diagnosticState.lastToolUsed = summarizationResult.tool;
        diagnosticState.status = "ready";
        return summarizationResult.reply;
    }

    const mathResult = localAiTools.evaluateMath(userPrompt);
    if (mathResult.handled) {
        diagnosticState.lastToolUsed = mathResult.tool;
        diagnosticState.status = "ready";
        return mathResult.reply;
    }

    const logicResult = localAiTools.evaluateLogic(userPrompt);
    if (logicResult.handled) {
        diagnosticState.lastToolUsed = logicResult.tool;
        diagnosticState.status = "ready";
        return logicResult.reply;
    }

    const techFactsResult = localAiTools.evaluateTechnicalFacts(userPrompt);
    if (techFactsResult.handled) {
        diagnosticState.lastToolUsed = techFactsResult.tool;
        diagnosticState.status = "ready";
        return techFactsResult.reply;
    }

    // 3. Check Chrome Prompt API (Gemini Nano on-device if available)
    const chromeReply = await queryChromePromptAPI(userPrompt);
    if (chromeReply) {
        diagnosticState.lastToolUsed = "chrome_prompt_api";
        diagnosticState.status = "ready";
        return chromeReply;
    }

    // 4. Delegate to Background Web Worker (Qwen2.5-0.5B-Instruct Neural Inference)
    const contextData = ContextManager.buildContext(userPrompt, history);
    diagnosticState.contextLengthTokens = contextData.totalEstimatedTokens;
    diagnosticState.activeMemoriesCount = contextData.memoryCount;
    diagnosticState.lastToolUsed = "qwen2.5_neural_worker";

    const worker = getAIWorker();
    if (worker) {
        try {
            const reqId = ++requestIdCounter;
            const workerPromise = new Promise((resolve, reject) => {
                pendingCallbacks.set(reqId, { resolve, reject });
                worker.postMessage({
                    type: "generate",
                    id: reqId,
                    messages: contextData.messages
                });
            });

            // 60s timeout for on-device generation
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Worker inference timeout")), 60000)
            );

            const result = await Promise.race([workerPromise, timeoutPromise]);
            diagnosticState.status = "ready";
            if (result && result.trim()) {
                return result.trim();
            }
        } catch (workerErr) {
            console.warn("[Offline AI] Worker inference notice:", workerErr?.message || workerErr);
        }
    }

    diagnosticState.status = "ready";
    return "I am BaatCheet AI. Please ask me any question about programming, science, mathematics, geography, history, or general conversation.";
};

export default {
    isOnline,
    initOfflineLLM,
    generateOfflineAiReply,
    diagnosticState
};
