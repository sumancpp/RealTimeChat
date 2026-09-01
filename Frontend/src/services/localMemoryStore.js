/**
 * Persistent Long-Term Memory Store for BaatCheet AI
 * 
 * 100% Offline, Local-first structured memory.
 * Stores user preferences, explicit facts, and profile notes in local storage.
 */

const MEMORY_STORAGE_KEY = "baatcheet_ai_long_term_memory_v1";

class LocalMemoryStore {
    constructor() {
        this.cache = null;
    }

    _load() {
        if (!this.cache) {
            if (typeof localStorage !== "undefined") {
                try {
                    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
                    this.cache = raw ? JSON.parse(raw) : {};
                } catch (e) {
                    this.cache = {};
                }
            } else {
                this.cache = {};
            }
        }
        if (!this.cache || typeof this.cache !== "object") {
            this.cache = {};
        }
        return this.cache;
    }

    _save() {
        if (typeof localStorage === "undefined") return;
        try {
            localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.cache || {}));
        } catch (e) {
            console.warn("[LocalMemoryStore] Failed to write localStorage:", e);
        }
    }

    /**
     * Store or update an explicit memory
     */
    set(key, value) {
        this._load();
        const cleanKey = key.trim().toLowerCase();
        this.cache[cleanKey] = {
            value: value.trim(),
            updatedAt: new Date().toISOString()
        };
        this._save();
        return true;
    }

    /**
     * Retrieve a specific memory
     */
    get(key) {
        this._load();
        const cleanKey = key.trim().toLowerCase();
        return this.cache[cleanKey] ? this.cache[cleanKey].value : null;
    }

    /**
     * Search memory for keywords
     */
    find(query) {
        this._load();
        const cleanQuery = query.trim().toLowerCase();
        const results = [];
        for (const [k, v] of Object.entries(this.cache)) {
            if (cleanQuery.includes(k) || k.includes(cleanQuery)) {
                results.push({ key: k, value: v.value });
            }
        }
        return results;
    }

    /**
     * Delete / forget a specific memory
     */
    delete(key) {
        this._load();
        const cleanKey = key.trim().toLowerCase();
        if (this.cache[cleanKey]) {
            delete this.cache[cleanKey];
            this._save();
            return true;
        }
        return false;
    }

    /**
     * Clear all long-term memories
     */
    clear() {
        this.cache = {};
        this._save();
        return true;
    }

    /**
     * List all memories
     */
    getAll() {
        this._load();
        return { ...this.cache };
    }

    /**
     * Parse natural language memory commands
     */
    handleMemoryCommand(prompt) {
        const text = prompt.trim();
        const lower = text.toLowerCase();

        // 1. Explicit Remember command: "Remember that my favorite color is purple" or "Remember my dog's name is Max"
        const rememberMatch = text.match(/remember\s+(?:that\s+)?(?:my\s+)?(.+?)\s+(?:is|are|=|was)\s+(.+)/i);
        if (rememberMatch) {
            const key = rememberMatch[1].trim();
            const val = rememberMatch[2].replace(/[\.!\?]+$/, "").trim();
            this.set(key, val);
            return {
                handled: true,
                reply: `I have saved to memory: **${key}** is **${val}**. I'll remember this for you! 🧠✨`
            };
        }

        // 2. Forget / Delete memory command: "Forget my favorite color" or "Delete memory of my dog"
        const forgetMatch = text.match(/(?:forget|delete memory(?: of)?|erase memory(?: of)?)\s+(?:my\s+)?(.+)/i);
        if (forgetMatch) {
            const key = forgetMatch[1].replace(/[\.!\?]+$/, "").trim();
            const deleted = this.delete(key);
            if (deleted) {
                return {
                    handled: true,
                    reply: `I have removed **${key}** from memory.`
                };
            } else {
                return {
                    handled: true,
                    reply: `I didn't have **${key}** stored in memory.`
                };
            }
        }

        // 3. Inspect memory command: "What do you remember about me?" or "Show my memory" or "List memories"
        if (lower.includes("what do you remember") || lower.includes("show my memory") || lower.includes("list memories") || lower === "memory" || lower === "@memory") {
            const all = this.getAll();
            const keys = Object.keys(all);
            if (keys.length === 0) {
                return {
                    handled: true,
                    reply: "Your local long-term memory is currently empty. You can ask me to remember things anytime (e.g. *\"Remember my favorite color is purple\"*)."
                };
            }
            const list = keys.map(k => `• **${k}**: ${all[k].value}`).join("\n");
            return {
                handled: true,
                reply: `Here is everything I remember locally about you:\n\n${list}`
            };
        }

        // 4. Query memory: "What is my favorite color?" or "Do you know my dog's name?"
        const queryMatch = text.match(/(?:what is|what's|what was|do you know|do you remember|tell me)\s+(?:my\s+)?(.+?)(?:\?|$)/i);
        if (queryMatch) {
            const subject = queryMatch[1].trim().toLowerCase();
            const match = this.get(subject);
            if (match) {
                return {
                    handled: true,
                    reply: `Your ${queryMatch[1].trim()} is **${match}**.`
                };
            }
            // Check substring matches
            const fuzzy = this.find(subject);
            if (fuzzy.length > 0) {
                return {
                    handled: true,
                    reply: `Your ${fuzzy[0].key} is **${fuzzy[0].value}**.`
                };
            }
        }

        return { handled: false };
    }
}

export const localMemoryStore = new LocalMemoryStore();
export default localMemoryStore;
