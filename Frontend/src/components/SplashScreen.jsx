import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const SplashScreen = () => {
    return (
        <div className="fixed inset-0 z-[99999] bg-[#05070e] w-screen h-screen min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden text-slate-100 p-4 select-none">
            {/* Ambient Background Glows */}
            <div className="w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow" />
            <div className="w-[450px] h-[450px] bg-fuchsia-600/20 rounded-full blur-[140px] pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center text-center z-10 w-full max-w-sm"
            >
                {/* Centered Splashing Logo */}
                <div className="relative mb-6 flex items-center justify-center">
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                    <motion.img
                        initial={{ scale: 0.85 }}
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        src="/logo.png"
                        alt="BaatCheet Logo"
                        className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(56,189,248,0.5)]"
                    />
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
                    <span>Baat</span>
                    <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Cheet
                    </span>
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
                </h1>
                
                <p className="text-slate-400 text-xs sm:text-sm mt-3 tracking-[0.25em] uppercase font-bold">
                    Real-Time Connectivity Engine
                </p>

                {/* Progress Bar */}
                <div className="w-48 sm:w-56 h-1.5 bg-slate-900/90 rounded-full overflow-hidden mt-8 border border-cyan-500/30 shadow-inner">
                    <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 animate-gradient" />
                </div>
            </motion.div>
        </div>
    );
};

export default SplashScreen;