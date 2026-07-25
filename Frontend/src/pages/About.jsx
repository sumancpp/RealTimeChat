import React, { useState } from 'react';
import { ArrowLeft, Send, Sparkles, Film, Palette, Music, Phone, Users, CheckCheck, Image, Trash2, Reply, Ghost, Swords, ShieldAlert, Cpu, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = () => {
    const [feedback, setFeedback] = useState("");
    const [name, setName] = useState("");
    const [sent, setSent] = useState(false);

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;
        
        const subject = encodeURIComponent(`BaatCheet Feedback from ${name || 'User'}`);
        const body = encodeURIComponent(feedback);
        window.location.href = `mailto:officialsuman666@gmail.com?subject=${subject}&body=${body}`;
        
        setSent(true);
        setFeedback("");
        setName("");
    };

    const crazyFeatures = [
        { 
            icon: <Ghost size={20} className="text-purple-400" />, 
            text: "Ghost Ink Mode: Send self-destructing secret messages that disintegrate 5 seconds after being revealed, displaying a real-time 'Ghost SMS is seen' status badge to both users.",
            usage: "Open the 3-dot (⋮) menu in any 1-on-1 chat and click 'Ghost Ink Mode', or type '@ghost your message' and send. When revealed, both users see 'Ghost SMS is seen ⏳ 5s' before complete deletion." 
        },
        { 
            icon: <Swords size={20} className="text-amber-400" />, 
            text: "Mini-Game Duel Hub: Challenge your chat partner to 3 interactive 2-player duels (Table Tennis 🏓, Tic-Tac-Toe ❌⭕, Rock-Paper-Scissors ✊✋✌️) with real-time permission prompts.",
            usage: "Open the 3-dot (⋮) menu in any 1-on-1 chat, click 'Play Mini-Game Duel', and choose a game. An instant invitation modal ('Accept & Play / Decline') pops up on your opponent's screen!" 
        },
        { 
            icon: <ShieldAlert size={20} className="text-emerald-400" />, 
            text: "Group Incognito Mode: Send anonymous messages in group chats where your identity is masked as 'Secret Member' with a classic incognito avatar.",
            usage: "In any Group Chat, click the Fedora Hat & Sunglasses Incognito icon in the message input bar to toggle Incognito Mode ON or OFF." 
        },
        { 
            icon: <Music size={20} className="text-pink-400" />, 
            text: "AI Mood Music: Automatically detects chat vibes and suggests playable YouTube Music cards.",
            usage: "Click the Music (🎵) icon next to the chat input to type '@music' and hit send." 
        },
        { 
            icon: <Sparkles size={20} className="text-amber-400" />, 
            text: "AI Roast Mode: Instantly generate hilarious AI-powered burns to send to your friends.",
            usage: "Click the Flame (🔥) icon next to the chat input to type '@roast' and hit send." 
        },
        { 
            icon: <Film size={20} className="text-purple-400" />, 
            text: "Chat Story Replay: Turn your last 48 hours of messages into a cinematic, animated playback.",
            usage: "Open the 3-dot (⋮) menu in any 1-on-1 chat and select 'Play Chat Story'." 
        },
        { 
            icon: <Palette size={20} className="text-cyan-400" />, 
            text: "Real-Time Whiteboard: Draw and brainstorm together live with your group members.",
            usage: "Click the Palette (🎨) icon at the top right of any Group Chat." 
        },
        { 
            icon: <Palette size={20} className="text-indigo-400" />, 
            text: "Custom Theming Engine: Personalize every chat with animated backgrounds like Cyberpunk or Sunset.",
            usage: "Open the 3-dot (⋮) menu in any 1-on-1 chat, select 'Theme', and choose your favorite." 
        }
    ];

    const standardFeatures = [
        { icon: <Phone size={18} className="text-emerald-400" />, text: "WebRTC Audio & Video Calls: High-quality, real-time face-to-face and voice calling." },
        { icon: <Users size={18} className="text-cyan-400" />, text: "Group Chats & Admin Controls: Create groups, add participants, and manage permissions." },
        { icon: <Image size={18} className="text-amber-400" />, text: "WhatsApp-Style Status Updates: Share 24-hour disappearing photo statuses with captions." },
        { icon: <CheckCheck size={18} className="text-indigo-400" />, text: "Read Receipts & Typing Indicators: Real-time 'Typing...' and blue double-tick read receipts." },
        { icon: <Music size={18} className="text-pink-400" />, text: "Voice Recording & File Sharing: Instantly record voice notes and share images seamlessly." },
        { icon: <Trash2 size={18} className="text-rose-400" />, text: "Edit & Delete Messages: Correct typos or delete messages for everyone instantly." },
        { icon: <Reply size={18} className="text-purple-400" />, text: "Reply & Reactions: Threaded replies and quick emoji reactions to individual messages." }
    ];

    return (
        <div className="min-h-screen bg-[#05070e] text-slate-100 overflow-y-auto pb-20 relative">
            {/* Cyber Ambient Glowing Blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-glow pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-glow pointer-events-none" style={{ animationDelay: '2.5s' }} />

            {/* Header */}
            <div className="sticky top-0 bg-[#0e1322]/90 backdrop-blur-xl z-20 border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between shadow-xl">
                <div className="flex items-center">
                    <Link to="/" className="p-2 mr-4 hover:bg-slate-800 rounded-2xl transition text-slate-300">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        About <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">BaatCheet</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-12 mt-2 relative flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[2px] shadow-xl shadow-cyan-500/20 mb-4">
                        <div className="w-full h-full bg-[#090d18] rounded-[14px] flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-cyan-400" />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                        The Next Generation of <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">Real-Time Messaging</span>
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
                        BaatCheet isn't just a messaging app. It's an interactive, AI-powered playground designed to bring friends closer through live voice/video calls, games, whiteboard art, and smart mood integrations.
                    </p>
                </div>

                {/* Features Section */}
                <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-cyan-500/20 mb-10 text-slate-100 backdrop-blur-2xl">
                    <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <Sparkles className="text-amber-400" /> Mind-Blowing Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {crazyFeatures.map((feat, idx) => (
                            <div key={idx} className="flex flex-col gap-2.5 p-5 rounded-2xl glass-card border border-cyan-500/10 glass-card-hover">
                                <div className="flex items-start gap-3.5">
                                    <div className="mt-0.5 p-2 rounded-xl bg-[#090d18] border border-cyan-500/20">{feat.icon}</div>
                                    <p className="text-slate-100 text-sm leading-relaxed font-bold">{feat.text}</p>
                                </div>
                                <div className="mt-1 pl-[3.25rem]">
                                    <p className="text-xs text-slate-400 bg-[#090d18]/80 p-3 rounded-xl border border-slate-800 font-medium">
                                        <span className="font-bold text-cyan-400">How to use: </span>{feat.usage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                        <Cpu className="text-cyan-400" /> Core Platform Capabilities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {standardFeatures.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#090d18]/50 border border-slate-800">
                                <div className="mt-0.5">{feat.icon}</div>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">{feat.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Form Section */}
                <div className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl border border-cyan-500/20 text-slate-100 backdrop-blur-2xl">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-extrabold mb-2 text-center text-white">We'd love your feedback!</h3>
                        <p className="text-slate-400 text-xs sm:text-sm text-center mb-8 font-medium">Have a feature idea or found an issue? Let us know directly.</p>
                        
                        {sent && (
                            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
                                Thank you! Your default mail app has been opened.
                            </div>
                        )}

                        <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Your Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="What should we call you?" 
                                    className="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Your Feedback</label>
                                <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you love, what we should improve, or ideas for the future..." 
                                    rows={4}
                                    className="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none font-medium"
                                    required
                                />
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                className="w-full glow-button text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                                <Send size={18} /> Send Direct Feedback
                            </motion.button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;
