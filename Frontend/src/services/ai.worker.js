/**
 * Dedicated AI Web Worker for BaatCheet
 * 
 * Runs pure Qwen2.5-0.5B-Instruct Neural Inference in a background thread.
 */

import { pipeline, env } from "@huggingface/transformers";

// Configure browser cache for offline storage
env.allowLocalModels = false;
env.useBrowserCache = true;

// Ensure WASM runs smoothly without requiring SharedArrayBuffer COOP/COEP headers
if (env.backends?.onnx?.wasm) {
    if (typeof crossOriginIsolated === "undefined" || !crossOriginIsolated) {
        env.backends.onnx.wasm.numThreads = 1;
    }
}

const QWEN_MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";

class AIWorkerPipeline {
    static instance = null;
    static activeDevice = "wasm";

    static async getInstance(progress_callback = null) {
        if (!this.instance) {
            let device = "wasm";
            
            // Check WebGPU availability safely
            if (typeof navigator !== "undefined" && navigator.gpu) {
                try {
                    const adapter = await navigator.gpu.requestAdapter();
                    if (adapter) device = "webgpu";
                } catch (e) {
                    device = "wasm";
                }
            }

            try {
                this.instance = await pipeline("text-generation", QWEN_MODEL_ID, {
                    dtype: "q4",
                    device: device,
                    progress_callback
                });
                this.activeDevice = device;
                console.log(`[AI Worker] Pipeline loaded with device: ${device}`);
            } catch (err) {
                console.warn(`[AI Worker] Device ${device} failed, falling back to wasm:`, err);
                this.instance = await pipeline("text-generation", QWEN_MODEL_ID, {
                    dtype: "q4",
                    device: "wasm",
                    progress_callback
                });
                this.activeDevice = "wasm";
                console.log("[AI Worker] Pipeline loaded with device: wasm");
            }
        }
        return this.instance;
    }
}

// Listen for messages from main thread
self.addEventListener("message", async (event) => {
    const { type, id, messages } = event.data || {};

    if (type === "init") {
        try {
            await AIWorkerPipeline.getInstance((progress) => {
                self.postMessage({ type: "init_progress", progress });
            });
            self.postMessage({
                type: "init_done",
                success: true,
                device: AIWorkerPipeline.activeDevice,
                model: QWEN_MODEL_ID
            });
        } catch (err) {
            console.error("[AI Worker] Init failed:", err);
            self.postMessage({ type: "init_done", success: false, error: err?.message || String(err) });
        }
        return;
    }

    if (type === "generate") {
        const startTime = Date.now();
        try {
            const generator = await AIWorkerPipeline.getInstance();
            if (!generator) {
                throw new Error("Neural pipeline unavailable");
            }

            const output = await generator(messages, {
                max_new_tokens: 220,
                temperature: 0.7,
                do_sample: true
            });

            const durationMs = Date.now() - startTime;
            const generated = output[0]?.generated_text;
            let resultText = "";

            if (Array.isArray(generated)) {
                const assistantMsg = generated[generated.length - 1];
                resultText = assistantMsg?.content?.trim() || "";
            } else if (typeof generated === "string") {
                resultText = generated.trim();
            }

            self.postMessage({
                type: "generate_done",
                id,
                text: resultText || "I understand. How else can I assist you?",
                durationMs,
                device: AIWorkerPipeline.activeDevice,
                model: QWEN_MODEL_ID
            });
        } catch (err) {
            console.error("[AI Worker] Generate error:", err);
            self.postMessage({
                type: "generate_error",
                id,
                error: err?.message || String(err)
            });
        }
    }
});
