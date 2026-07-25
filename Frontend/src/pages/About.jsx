import React, { useState } from 'react';
import { ArrowLeft, Send, Sparkles, Film, Palette, Music, Phone, Users, CheckCheck, Image, Trash2, Reply, Ghost, Swords, ShieldAlert, Cpu, MessageSquare, Mic, Eye, Bot, BarChart2, Languages, Code2, FileText, Lock, Search, Heart } from 'lucide-react';
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
            icon: <Eye size={20} className="text-rose-400" />, 
            text: "View-Once Media Disappear: Send photos or videos that recipients can open only once before self-destructing forever.",
            usage: "Select a photo in chat → tap the ① icon before sending to mark it as View-Once media!" 
        },
        { 
            icon: <Mic size={20} className="text-teal-400" />, 
            text: "Voice Pitch Modifier Notes: Record voice notes with fun pitch modification filters like Robot 🤖, Chipmunk 🐿️, Deep Male 🎙️, and Echo 🔊.",
            usage: "Hold the microphone icon to record → select a voice pitch filter before sending to surprise your friends!" 
        },
        { 
            icon: <BarChart2 size={20} className="text-violet-400" />, 
            text: "AI Chat Sentiment & Vibe Meter: Analyzes conversation tone in real-time and displays a live vibe score (Positive/Neutral/Spicy) with mood insights.",
            usage: "Open the 3-dot (⋮) menu in any chat → click '🤖 AI Features Hub' → select 'AI Chat Vibe Meter'." 
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
            text: "Custom Theming Engine: Personalize every chat with animated backgrounds like Cyberpunk, Sunset, or OLED Midnight.",
            usage: "Open the 3-dot (⋮) menu in any 1-on-1 chat, select 'Theme', and choose your favorite." 
        }
    ];

    const standardFeatures = [
        { icon: <Phone size={18} className="text-emerald-400" />, text: "WebRTC Audio & Video Calls: High-quality, real-time face-to-face and voice calling." },
        { icon: <Users size={18} className="text-cyan-400" />, text: "Group Chats & Admin Controls: Create groups, add/remove participants, promote admins, and edit group info." },
        { icon: <Image size={18} className="text-amber-400" />, text: "WhatsApp-Style Status Updates: Share 24-hour disappearing photo statuses with captions and viewer lists." },
        { icon: <Languages size={18} className="text-blue-400" />, text: "AI Language Translator: Instant live translation of chat messages into 10+ languages." },
        { icon: <Code2 size={18} className="text-emerald-400" />, text: "AI Code Reviewer: Paste code snippets for instant AI syntax and optimization analysis." },
        { icon: <FileText size={18} className="text-purple-400" />, text: "AI Voice & Chat Transcriber: Speech-to-text transcription and instant long chat thread summaries." },
        { icon: <Bot size={18} className="text-cyan-400" />, text: "BaatCheet AI Assistant: Smart 24/7 AI companion built right into your contact list." },
        { icon: <Search size={18} className="text-indigo-400" />, text: "Search by Username: Find friends instantly without sharing phone numbers." },
        { icon: <Lock size={18} className="text-rose-400" />, text: "Security Question Recovery: Secure account recovery via custom security questions." },
        { icon: <CheckCheck size={18} className="text-indigo-400" />, text: "Read Receipts & Typing Indicators: Real-time 'Typing...' and blue double-tick read receipts." },
        { icon: <Mic size={18} className="text-pink-400" />, text: "Voice Recording & File Sharing: Instantly record voice notes and share images seamlessly." },
        { icon: <Trash2 size={18} className="text-rose-400" />, text: "Edit & Delete Messages: Correct typos or delete messages for everyone instantly." },
        { icon: <Reply size={18} className="text-purple-400" />, text: "Reply & Emoji Reactions: Threaded replies and quick emoji reactions to individual messages." }
    ];

    return (
        <div className="min-h-screen bg-[#05070e] text-slate-100 overflow-y-auto pb-20 relative font-sans">
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

                {/* Crazy Features Section */}
                <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-cyan-500/20 mb-10 text-slate-100 backdrop-blur-2xl">
                    <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <Sparkles className="text-amber-400" size={22} /> 🔥 Exclusive Interactive Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {crazyFeatures.map((feat, index) => (
                            <div key={index} className="p-5 rounded-2xl bg-[#090d18] border border-cyan-500/15 flex flex-col gap-2.5 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                        {feat.icon}
                                    </div>
                                    <h4 className="font-bold text-sm text-white">{feat.text.split(':')[0]}</h4>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    {feat.text.split(':').slice(1).join(':')}
                                </p>
                                <div className="mt-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 font-semibold">
                                    💡 <span className="font-bold text-white">How to use:</span> {feat.usage}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Standard Features Section */}
                <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-cyan-500/20 mb-10 text-slate-100 backdrop-blur-2xl">
                    <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <Cpu className="text-cyan-400" size={22} /> ⚡ Powerful Core & AI Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {standardFeatures.map((feat, index) => (
                            <div key={index} className="p-4 rounded-2xl bg-[#090d18] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
                                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                    {feat.icon}
                                </div>
                                <p className="text-xs text-slate-200 font-medium leading-relaxed">{feat.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-cyan-500/20 text-slate-100 backdrop-blur-2xl">
                    <h3 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2.5">
                        <Send className="text-cyan-400" size={22} /> Send Us Feedback
                    </h3>
                    <p className="text-slate-400 text-xs mb-6 font-medium">Have a suggestion or feature request? We'd love to hear from you!</p>

                    {sent ? (
                        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold text-center">
                            🎉 Thank you for your feedback! Your email client has been opened.
                        </div>
                    ) : (
                        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Your Name</label>
                                <input 
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Your Feedback</label>
                                <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you think or what feature you'd like to see next..."
                                    rows="4"
                                    required
                                    className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white focus:outline-none resize-none"
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full py-3.5 glow-button text-white font-bold text-xs rounded-xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Send size={16} /> Submit Feedback
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default About;
