import React, { useState } from 'react';
import { ArrowLeft, Send, Sparkles, Gamepad2, Film, Palette, Music, Phone, Users, CheckCheck, Image, Trash2, Reply } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    const [feedback, setFeedback] = useState("");
    const [name, setName] = useState("");

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;
        
        const subject = encodeURIComponent(`BaatCheet Feedback from ${name || 'User'}`);
        const body = encodeURIComponent(feedback);
        window.location.href = `mailto:suumaan@zohomail.in?subject=${subject}&body=${body}`;
        
        setFeedback("");
        setName("");
    };

    const crazyFeatures = [
        { 
            icon: <Music size={20} className="text-pink-500" />, 
            text: "AI Mood Music: Automatically detects chat vibes and suggests playable YouTube Music cards.",
            usage: "Click the Music (🎵) icon next to the chat input to type '@music' and hit send." 
        },
        { 
            icon: <Sparkles size={20} className="text-orange-500" />, 
            text: "AI Roast Mode: Instantly generate hilarious AI-powered burns to send to your friends.",
            usage: "Click the Flame (🔥) icon next to the chat input to type '@roast' and hit send." 
        },
        { 
            icon: <Film size={20} className="text-purple-500" />, 
            text: "Chat Story Replay: Turn your last 48 hours of messages into a cinematic, animated playback.",
            usage: "Open the 3-dot (⋮) menu in any 1-on-1 chat and select 'Play Chat Story'." 
        },
        { 
            icon: <Palette size={20} className="text-blue-500" />, 
            text: "Real-Time Whiteboard: Draw and brainstorm together live with your group members.",
            usage: "Click the Palette (🎨) icon at the top right of any Group Chat." 
        },
        { 
            icon: <Gamepad2 size={20} className="text-green-500" />, 
            text: "Live Table Tennis: Challenge your friends to an interactive multiplayer table tennis game right inside the chat.",
            usage: "Type '@game' as a message and hit send to invite your friend to a match." 
        },
        { 
            icon: <Palette size={20} className="text-indigo-500" />, 
            text: "Custom Theming Engine: Personalize every chat with animated backgrounds like Cyberpunk or Sunset.",
            usage: "Open the 3-dot (⋮) menu in any 1-on-1 chat, select 'Theme', and choose your favorite." 
        }
    ];

    const standardFeatures = [
        { icon: <Phone size={20} className="text-teal-500" />, text: "WebRTC Audio & Video Calls: High-quality, real-time face-to-face and voice calling." },
        { icon: <Users size={20} className="text-blue-400" />, text: "Group Chats & Admin Controls: Create groups, add participants, and manage permissions." },
        { icon: <Image size={20} className="text-yellow-500" />, text: "WhatsApp-Style Status Updates: Share 24-hour disappearing photo statuses with captions." },
        { icon: <CheckCheck size={20} className="text-blue-500" />, text: "Read Receipts & Typing Indicators: Real-time 'Typing...' and blue double-tick read receipts." },
        { icon: <Music size={20} className="text-gray-500" />, text: "Voice Recording & File Sharing: Instantly record voice notes and share images seamlessly." },
        { icon: <Trash2 size={20} className="text-red-500" />, text: "Edit & Delete Messages: Correct typos or delete messages for everyone instantly." },
        { icon: <Reply size={20} className="text-gray-600" />, text: "Reply & Reactions: Threaded replies and quick emoji reactions to individual messages." }
    ];

    return (
        <div className="min-h-screen bg-slate-50 overflow-y-auto pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-200 px-6 py-4 flex items-center shadow-sm">
                <Link to="/" className="p-2 mr-4 hover:bg-gray-100 rounded-full transition text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-[#0b2a5b]">About <span className="text-orange-500">BaatCheet</span></h1>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                
                {/* Hero Section */}
                <div className="text-center mb-16 mt-8">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0b2a5b] to-orange-500 mb-4">
                        The Next Generation of Chat
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        BaatCheet isn't just a messaging app. It's an interactive, AI-powered playground designed to bring you and your friends closer together through games, art, and music.
                    </p>
                </div>

                {/* Features Section */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                        <Sparkles className="text-orange-500" /> Mind-Blowing Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {crazyFeatures.map((feat, idx) => (
                            <div key={idx} className="flex flex-col gap-2 p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition border border-gray-100 shadow-sm hover:shadow-md">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 bg-white p-2 rounded-xl shadow-sm border border-gray-100">{feat.icon}</div>
                                    <p className="text-gray-800 leading-relaxed font-semibold">{feat.text}</p>
                                </div>
                                <div className="mt-2 pl-[3.25rem]">
                                    <p className="text-sm text-gray-500 bg-gray-100/50 p-3 rounded-xl border border-gray-200/50">
                                        <span className="font-bold text-gray-700">How to use: </span>{feat.usage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                        Essential Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {standardFeatures.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3">
                                <div className="mt-1">{feat.icon}</div>
                                <p className="text-gray-600 text-sm leading-relaxed">{feat.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Form Section */}
                <div className="bg-gradient-to-br from-[#0b2a5b] to-indigo-900 rounded-3xl p-8 shadow-2xl text-white">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold mb-2 text-center">We'd love your feedback!</h3>
                        <p className="text-indigo-200 text-center mb-8">Have a crazy idea or found a bug? Let us know directly.</p>
                        
                        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-indigo-200 mb-2">Your Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="What should we call you?" 
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-200 mb-2">Your Feedback</label>
                                <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you love, what you hate, or what we should build next..." 
                                    rows={4}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <Send size={20} /> Send Feedback to Developer
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;
