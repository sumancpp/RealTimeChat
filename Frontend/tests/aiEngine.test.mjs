/**
 * Automated Test Suite for BaatCheet AI Engine
 * 
 * Verifies all 10 core capability benchmarks required for reliable offline assistant performance:
 * 1. Mathematical Arithmetic (17 × 24 = 408)
 * 2. Logical Deductive Syllogism (All cats are animals / Luna is a cat)
 * 3. Arithmetic Word Problem (3 apples - 1 apple + 5 apples = 7 apples)
 * 4. Physics Trick Question (1 kg iron vs 1 kg feathers)
 * 5. Memory Store & Recall (Remember favorite color is purple -> Recall purple)
 * 6. Memory Isolation (No hallucinations when memory is empty / deleted)
 * 7. Conversation Accuracy & Fact Summarization (Summarizes only facts present)
 * 8. Offline Internet Limitation (Transparently states offline status on current events)
 * 9. Hallucination Prevention (Refuses to invent unmentioned facts like a dog)
 * 10. Technical Definition Accuracy (RAM volatile vs Storage non-volatile)
 */

import assert from "node:assert/strict";

// Mock localStorage for Node test runner
const memoryStorage = new Map();
global.localStorage = {
    getItem: (key) => memoryStorage.get(key) || null,
    setItem: (key, val) => memoryStorage.set(key, String(val)),
    removeItem: (key) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear()
};

global.navigator = {
    onLine: false
};

// Import services
import { localMemoryStore } from "../src/services/localMemoryStore.js";
import { localAiTools } from "../src/services/localAiTools.js";
import { ContextManager } from "../src/services/contextManager.js";
import { generateOfflineAiReply } from "../src/services/offlineAiEngine.js";

async function runTests() {
    console.log("\n=======================================================");
    console.log("  🚀 RUNNING BAATCHEET AI ENGINE AUTOMATED TEST SUITE  ");
    console.log("=======================================================\n");

    let passed = 0;
    let total = 0;

    const test = async (name, fn) => {
        total++;
        try {
            await fn();
            console.log(`  ✅ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ❌ [FAIL] ${name}`);
            console.error(`     Error: ${err.message}\n`);
        }
    };

    // TEST 1: Math Calculation
    await test("Test 1: Math Arithmetic (17 × 24 = 408)", async () => {
        const reply = await generateOfflineAiReply("What is 17 × 24? Explain your calculation");
        assert.match(reply, /408/, "Reply must contain 408");
        assert.match(reply, /17\s*×\s*24/, "Reply must show multiplication calculation");
    });

    // TEST 2: Logical Deductive Syllogism
    await test("Test 2: Logical Reasoning (All cats are animals, Luna is a cat)", async () => {
        const reply = await generateOfflineAiReply("If all cats are animals and Luna is a cat, what can we conclude about Luna?");
        assert.match(reply, /Luna is an animal/i, "Conclusion must deduce Luna is an animal");
        assert.match(reply, /deduct|modus ponens|premise/i, "Must provide logical reasoning proof");
    });

    // TEST 3: Arithmetic Word Problem
    await test("Test 3: Arithmetic Word Problem (3 apples - 1 apple + 5 apples = 7 apples)", async () => {
        const reply = await generateOfflineAiReply("3 apples - 1 apple + 5 apples");
        assert.match(reply, /7 apples/i, "Must calculate 7 apples");
    });

    // TEST 4: Trick Physics Question
    await test("Test 4: Trick Question (1 kg iron vs 1 kg feathers)", async () => {
        const reply = await generateOfflineAiReply("Which is heavier: 1 kg of iron or 1 kg of feathers?");
        assert.match(reply, /same|neither|equal/i, "Must state they weigh the same (1 kg)");
        assert.match(reply, /mass/i, "Must explain mass equivalence");
    });

    // TEST 5: Persistent Memory (Remember & Recall)
    await test("Test 5: Memory Store & Recall (Remember favorite color is purple)", async () => {
        const storeReply = await generateOfflineAiReply("Remember that my favorite color is purple");
        assert.match(storeReply, /purple/i, "Must confirm saving purple to memory");

        const recallReply = await generateOfflineAiReply("What is my favorite color?");
        assert.match(recallReply, /purple/i, "Must recall purple from long-term memory");
    });

    // TEST 6: Memory Isolation
    await test("Test 6: Memory Isolation (Forget memory and verify no hallucination)", async () => {
        localMemoryStore.clear();
        const unremembered = localMemoryStore.get("favorite color");
        assert.equal(unremembered, null, "Memory must be empty");

        const reply = await generateOfflineAiReply("What do you remember about me?");
        assert.match(reply, /empty/i, "Must state memory is empty");
    });

    // TEST 7: Conversation Accuracy & Summarization
    await test("Test 7: Conversation Accuracy & Summarization", async () => {
        const history = [
            { sender: "user", message: "I am building a React chat app" },
            { sender: "ai", message: "That sounds awesome!", isAIMessage: true },
            { sender: "user", message: "We use MongoDB and Node.js backend" }
        ];
        const reply = await generateOfflineAiReply("Summarize our conversation", history);
        assert.match(reply, /React chat app/i, "Summary must contain facts from conversation");
        assert.match(reply, /MongoDB/i, "Summary must contain MongoDB fact");
    });

    // TEST 8: Offline Internet Limitation & Transparency
    await test("Test 8: Internet Limitation (What happened yesterday?)", async () => {
        global.navigator.onLine = false;
        const reply = await generateOfflineAiReply("What happened yesterday?");
        assert.match(reply, /offline|live internet|real-time/i, "Must state offline limitation");
    });

    // TEST 9: Hallucination Prevention
    await test("Test 9: Hallucination Prevention (What did I tell you about my dog?)", async () => {
        const history = [
            { sender: "user", message: "Hello AI!" },
            { sender: "ai", message: "Hi! How can I help you?", isAIMessage: true }
        ];
        const reply = await generateOfflineAiReply("What did I tell you about my dog?", history);
        assert.match(reply, /haven't told me about your dog/i, "Must state dog was never mentioned");
    });

    // TEST 10: Technical Definitions (RAM vs Storage)
    await test("Test 10: RAM vs Storage Accuracy", async () => {
        const reply = await generateOfflineAiReply("What is the difference between RAM and storage?");
        assert.match(reply, /volatile/i, "Must correctly explain RAM volatility");
        assert.match(reply, /non-volatile|permanent/i, "Must correctly explain storage permanence");
    });

    console.log("\n-------------------------------------------------------");
    console.log(`  RESULT: ${passed} / ${total} Tests Passed (${Math.round((passed/total)*100)}%)`);
    console.log("-------------------------------------------------------\n");

    if (passed === total) {
        console.log("🎉 ALL BAATCHEET AI ENGINE TESTS PASSED PERFECTLY!\n");
        process.exit(0);
    } else {
        console.error("⚠️ Some tests failed. Please review errors above.\n");
        process.exit(1);
    }
}

runTests();
