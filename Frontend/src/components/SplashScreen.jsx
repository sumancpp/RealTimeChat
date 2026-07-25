import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#05070e] flex flex-col items-center justify-center relative overflow-hidden text-slate-100 p-6"
        >
            {/* Cyber Ambient Glowing Blobs */}
            <div className="w-[500px] h-[500px] bg-cyan-600/25 rounded-full blur-[120px] animate-glow pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="w-[450px] h-[450px] bg-fuchsia-600/20 rounded-full blur-[120px] animate-glow pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center text-center z-10 my-auto"
            >
                {/* Splashing Logo in Middle of Screen */}
                <div className="relative mb-6 flex items-center justify-center">
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-full blur-xl opacity-60 animate-pulse" />
                    <motion.img
                        initial={{ scale: 0.7 }}
                        animate={{ scale: [0.9, 1.08, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        src="/logo.png"
                        alt="BaatCheet Logo"
                        className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(56,189,248,0.5)]"
                    />
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5">
                    <span>Baat</span>
                    <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Cheet
                    </span>
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-3 tracking-[0.25em] uppercase font-bold">Real-Time Connectivity Engine</p>

                <div className="w-44 sm:w-56 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-8 border border-cyan-500/30 shadow-inner">
                    <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 animate-gradient" />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;