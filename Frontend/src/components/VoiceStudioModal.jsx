import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trash2, Send, Mic, Sparkles, Radio, Bot, Ghost, Volume2 } from 'lucide-react';

const VOICE_PRESETS = [
    { id: 'normal', name: 'Normal', icon: Mic, color: 'from-blue-500 to-indigo-600', desc: 'Original Voice' },
    { id: 'chipmunk', name: 'Chipmunk', icon: Sparkles, color: 'from-pink-500 to-rose-500', desc: 'High Pitch' },
    { id: 'monster', name: 'Monster', icon: Ghost, color: 'from-purple-600 to-indigo-900', desc: 'Deep Bass' },
    { id: 'robot', name: 'Robot', icon: Bot, color: 'from-cyan-500 to-blue-600', desc: 'Metallic Sci-Fi' },
    { id: 'radio', name: '1940s Radio', icon: Radio, color: 'from-amber-500 to-orange-600', desc: 'Retro Vintage' },
    { id: 'echo', name: 'Space Echo', icon: Volume2, color: 'from-emerald-500 to-teal-700', desc: 'Cosmic Reverb' },
];

// Helper function to encode AudioBuffer into WAV format Blob
const bufferToWav = (buffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    let channels = [], sampleRate = buffer.sampleRate, offset = 0, pos = 0;

    function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);         // length of format chunk
    setUint16(1);          // raw PCM
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);         // 16-bit
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            out.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([out], { type: 'audio/wav' });
};

const attachEffectNodes = (ctx, source, effect) => {
    if (effect === 'chipmunk') {
        source.playbackRate.value = 1.35;
        source.connect(ctx.destination);
    } else if (effect === 'monster') {
        source.playbackRate.value = 0.75;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        source.connect(filter);
        filter.connect(ctx.destination);
    } else if (effect === 'robot') {
        source.playbackRate.value = 1.0;
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 900;
        filter.Q.value = 6;
        filter.gain.value = 14;
        source.connect(filter);
        filter.connect(ctx.destination);
    } else if (effect === 'radio') {
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1400;
        bandpass.Q.value = 2.5;

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 350;

        source.connect(bandpass);
        bandpass.connect(highpass);
        highpass.connect(ctx.destination);
    } else if (effect === 'echo') {
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.22;

        const feedback = ctx.createGain();
        feedback.gain.value = 0.35;

        source.connect(ctx.destination);
        source.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(ctx.destination);
    } else {
        source.connect(ctx.destination);
    }
};

const VoiceStudioModal = ({ audioBlob, onSend, onClose }) => {
    const [selectedPreset, setSelectedPreset] = useState('normal');
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioBuffer, setAudioBuffer] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioCtxRef = useRef(null);
    const activeSourceRef = useRef(null);
    const animFrameRef = useRef(null);
    const startTimeRef = useRef(0);

    // Decode audioBlob on mount
    useEffect(() => {
        let isMounted = true;
        const initAudio = async () => {
            try {
                const arrayBuffer = await audioBlob.arrayBuffer();
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                audioCtxRef.current = ctx;
                const decoded = await ctx.decodeAudioData(arrayBuffer);
                if (isMounted) {
                    setAudioBuffer(decoded);
                    setDuration(decoded.duration);
                }
            } catch (err) {
                console.error("Audio decode error:", err);
            }
        };
        initAudio();

        return () => {
            isMounted = false;
            stopPreview();
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, [audioBlob]);

    const stopPreview = () => {
        if (activeSourceRef.current) {
            try {
                activeSourceRef.current.stop();
            } catch (e) {}
            activeSourceRef.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
        }
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const playPreview = (presetId = selectedPreset) => {
        if (!audioBuffer || !audioCtxRef.current) return;
        stopPreview();

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        activeSourceRef.current = source;

        attachEffectNodes(ctx, source, presetId);

        const startTime = ctx.currentTime;
        startTimeRef.current = startTime;
        source.start(0);
        setIsPlaying(true);

        const updateProgress = () => {
            const elapsed = ctx.currentTime - startTimeRef.current;
            const rate = source.playbackRate.value || 1.0;
            const effectiveDuration = duration / rate;

            if (elapsed >= effectiveDuration) {
                setIsPlaying(false);
                setCurrentTime(0);
            } else {
                setCurrentTime(elapsed * rate);
                animFrameRef.current = requestAnimationFrame(updateProgress);
            }
        };
        updateProgress();

        source.onended = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
    };

    const handleSelectPreset = (id) => {
        setSelectedPreset(id);
        if (isPlaying) {
            playPreview(id);
        }
    };

    const handleSendMorphedVoice = async () => {
        if (!audioBuffer) {
            onSend(audioBlob);
            return;
        }

        if (selectedPreset === 'normal') {
            onSend(audioBlob);
            return;
        }

        try {
            setIsProcessing(true);
            stopPreview();

            // Calculate playback rate for offline context size
            let playbackRate = 1.0;
            if (selectedPreset === 'chipmunk') playbackRate = 1.35;
            if (selectedPreset === 'monster') playbackRate = 0.75;

            const renderLength = Math.ceil((audioBuffer.duration / playbackRate) * audioBuffer.sampleRate);
            const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
                audioBuffer.numberOfChannels,
                renderLength,
                audioBuffer.sampleRate
            );

            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;
            attachEffectNodes(offlineCtx, source, selectedPreset);
            source.start(0);

            const renderedBuffer = await offlineCtx.startRendering();
            const wavBlob = bufferToWav(renderedBuffer);

            onSend(wavBlob);
        } catch (err) {
            console.error("Error morphing audio:", err);
            onSend(audioBlob);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-white">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-slate-900 p-5 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                            <Sparkles size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-white">Voice Morphing Studio</h2>
                            <p className="text-xs text-slate-400">Select a sound effect filter before sending</p>
                        </div>
                    </div>
                </div>

                {/* Player Preview Bar */}
                <div className="p-6 bg-slate-950/60 border-b border-slate-800/80 flex flex-col items-center gap-4">
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => isPlaying ? stopPreview() : playPreview()}
                            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-all"
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                        </button>

                        <div className="flex-1 mx-4">
                            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-100"
                                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Animated sound wave bars when playing */}
                    <div className="flex items-center gap-1 h-6">
                        {[40, 70, 30, 90, 60, 100, 50, 80, 30, 65, 45, 95].map((h, idx) => (
                            <div
                                key={idx}
                                className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`}
                                style={{ height: isPlaying ? `${Math.max(20, (h * Math.random()).toFixed(0))}%` : '20%' }}
                            />
                        ))}
                    </div>
                </div>

                {/* Presets Grid */}
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {VOICE_PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = selectedPreset === preset.id;
                        return (
                            <button
                                key={preset.id}
                                onClick={() => handleSelectPreset(preset.id)}
                                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all relative overflow-hidden text-center ${
                                    isSelected 
                                        ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10' 
                                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                                }`}
                            >
                                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${preset.color} text-white shadow-md`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-xs text-slate-200">{preset.name}</h4>
                                    <p className="text-[10px] text-slate-400">{preset.desc}</p>
                                </div>
                                {isSelected && (
                                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Discard
                    </button>

                    <button
                        onClick={handleSendMorphedVoice}
                        disabled={isProcessing}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <span>Applying Effect...</span>
                        ) : (
                            <>
                                <Send size={16} /> Send Voice Note
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default VoiceStudioModal;
