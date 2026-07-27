import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, KeyRound, Lock, ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react";
import { serverUrl } from "../config";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getQuestion = async (e) => {
    e?.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.post(`${serverUrl}/get-security-question`, { email });
      setSecurityQuestion(res.data.securityQuestion);
      setStep(2);
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Error fetching security question");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e?.preventDefault();
    if (!securityAnswer || !newPassword) return;
    try {
      setLoading(true);
      setErrorMsg("");
      await axios.post(`${serverUrl}/reset-password-question`, {
        email,
        securityAnswer,
        newPassword
      });
      alert("Password Updated Successfully! Please Sign In.");
      navigate("/login");
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full h-screen h-[100dvh] bg-[#05070e] flex items-center justify-center px-4 py-8 relative overflow-y-auto text-slate-100'>
      {/* Cyber Ambient Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-glow pointer-events-none" style={{ animationDelay: '2.5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className='w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-cyan-500/20 text-slate-100 backdrop-blur-2xl'
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Reset</span>
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              Password
            </span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">Verify your email & security question to reset</p>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={getQuestion} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white glow-button text-sm cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Continue to Verification"
              )}
            </motion.button>
          </form>
        )}

        {/* Step 2: Security Answer & New Password */}
        {step === 2 && (
          <form onSubmit={resetPassword} className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Security Question:</span>
              "{securityQuestion}"
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Your Security Answer</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter your security answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••• (Min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white glow-button text-sm cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Reset Password & Sign In"
              )}
            </motion.button>
          </form>
        )}

        {/* Back to Login link */}
        <div className="mt-6 text-center border-t border-slate-800 pt-4">
          <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;