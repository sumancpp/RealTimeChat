import React, { useState, useEffect } from 'react';
import { Ghost, Sparkles, Flame } from 'lucide-react';

const GhostMessageBubble = ({ msg, isOwn, renderMessageWithLinks }) => {
    const [revealed, setRevealed] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [disintegrated, setDisintegrated] = useState(false);

    useEffect(() => {
        let timer = null;
        if (revealed && !disintegrated) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setDisintegrated(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [revealed, disintegrated]);

    const handleReveal = () => {
        if (!revealed && !disintegrated) {
            setRevealed(true);
        }
    };

    const textContent = msg.message.startsWith('@ghost')
        ? msg.message.replace('@ghost', '').trim()
        : msg.message;

    return (
        <div 
            onClick={handleReveal}
            className={`relative group max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl cursor-pointer transition-all duration-300 shadow-md ${
                isOwn ? 'ml-auto rounded-tr-none' : 'mr-auto rounded-tl-none'
            } ${
                disintegrated 
                    ? 'bg-slate-900/60 border border-purple-900/40 text-purple-400/60 italic' 
                    : revealed
                        ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/50 shadow-purple-500/20'
                        : 'bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 border border-purple-400/60 hover:border-purple-400 hover:shadow-purple-500/30 animate-pulse'
            }`}
        >
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-1.5 text-xs font-semibold text-purple-300/80 border-b border-purple-500/20 pb-1">
                <div className="flex items-center gap-1.5">
                    <Ghost size={14} className="text-purple-400 animate-bounce" />
                    <span>Ghost Ink</span>
                </div>
                {revealed && !disintegrated && (
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/40 font-mono animate-pulse">
                        ⏳ {countdown}s
                    </span>
                )}
            </div>

            {/* Content Body */}
            {disintegrated ? (
                <div className="flex items-center gap-2 py-1 text-xs text-purple-400/50">
                    <Flame size={14} className="text-purple-500/40" />
                    <span>[ Message Disintegrated ]</span>
                </div>
            ) : !revealed ? (
                <div className="py-2 text-center text-xs font-semibold text-purple-200 tracking-wide flex items-center justify-center gap-2 select-none">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>Tap to Reveal Ghost Message</span>
                </div>
            ) : (
                <div 
                    className="text-sm font-medium text-purple-100 transition-all duration-700 break-words"
                    style={{
                        filter: `blur(${(5 - countdown) * 1.2}px)`,
                        opacity: Math.max(0.2, countdown / 5),
                        textShadow: '0 0 8px rgba(192, 132, 252, 0.6)'
                    }}
                >
                    {renderMessageWithLinks ? renderMessageWithLinks(textContent) : textContent}
                </div>
            )}
        </div>
    );
};

export default GhostMessageBubble;
