import React, { useState, useEffect } from "react";
import { diagnosticState } from "../services/offlineAiEngine";
import { localMemoryStore } from "../services/localMemoryStore";
import { Activity, Cpu, HardDrive, Brain, Zap, X, Trash2, RefreshCw } from "lucide-react";

const DiagnosticsModal = ({ isOpen, onClose }) => {
    const [stats, setStats] = useState({ ...diagnosticState });
    const [memories, setMemories] = useState({});

    const refreshStats = () => {
        setStats({ ...diagnosticState });
        setMemories(localMemoryStore.getAll());
    };

    useEffect(() => {
        if (isOpen) {
            refreshStats();
            const interval = setInterval(refreshStats, 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const memoryKeys = Object.keys(memories);

    const handleClearMemory = () => {
        localMemoryStore.clear();
        refreshStats();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0f1422] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-2.5">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <h2 className="font-semibold text-lg">AI Developer Diagnostics</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Model Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <Brain className="w-3.5 h-3.5 text-blue-400" />
                                Model
                            </div>
                            <div className="text-sm font-medium truncate" title={stats.modelName}>
                                {stats.modelName}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                                Runtime Backend
                            </div>
                            <div className="text-sm font-medium">
                                {stats.backend}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                Last Gen Time
                            </div>
                            <div className="text-sm font-medium">
                                {stats.lastGenerationTimeMs > 0 ? `${stats.lastGenerationTimeMs} ms` : "Instant (Tool)"}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                                Last Tool / Engine
                            </div>
                            <div className="text-sm font-medium capitalize truncate" title={stats.lastToolUsed}>
                                {stats.lastToolUsed.replace(/_/g, " ")}
                            </div>
                        </div>
                    </div>

                    {/* Context & Token Length */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                            <span>Context Tokens (Estimated)</span>
                            <span className="font-mono text-white">{stats.contextLengthTokens} / 1500 tokens</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (stats.contextLengthTokens / 1500) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Long-Term Memory Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                                Long-Term Memory Store ({memoryKeys.length})
                            </span>
                            {memoryKeys.length > 0 && (
                                <button
                                    onClick={handleClearMemory}
                                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Clear Memory
                                </button>
                            )}
                        </div>

                        {memoryKeys.length === 0 ? (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-white/40">
                                No memories stored yet. Tell the AI: <span className="text-emerald-400 font-mono">"Remember my favorite color is purple"</span>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {memoryKeys.map((k) => (
                                    <div
                                        key={k}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/5 text-xs"
                                    >
                                        <div className="space-y-0.5 truncate">
                                            <span className="font-semibold text-emerald-300 capitalize">{k}:</span>{" "}
                                            <span className="text-white/80">{memories[k].value}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                localMemoryStore.delete(k);
                                                refreshStats();
                                            }}
                                            className="p-1 text-white/40 hover:text-rose-400 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-white/[0.02] text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        100% Offline & On-Device
                    </span>
                    <button
                        onClick={refreshStats}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticsModal;
