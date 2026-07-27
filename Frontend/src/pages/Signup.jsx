import React, { useState } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, HelpCircle, KeyRound, Sparkles } from "lucide-react";
import { serverUrl } from '../config';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

const Signup = () => {
  let navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  let dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswer: ""
  });

  const securityQuestionsList = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What was the name of your first school?",
    "In what city were you born?",
    "What is your favorite book?",
    "What is your favorite movie?",
    "What was your childhood nickname?",
    "What is the name of your favorite teacher?",
    "What is your favorite food?",
    "What is your favorite sports team?",
    "What is your dream job?",
    "Who was your childhood hero?",
    "What is the name of the street you grew up on?",
    "What is the make of your first car?",
    "What is your favorite color?"
  ];

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) {
      setError("Full Name is required ❌");
      setLoading(false);
      return;
    }

    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format ❌");
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters ❌");
      setLoading(false);
      return;
    }

    if (!formData.securityQuestion) {
      setError("Please select a security question ❌");
      setLoading(false);
      return;
    }

    if (!formData.securityAnswer) {
      setError("Please provide an answer to your security question ❌");
      setLoading(false);
      return;
    }

    setError("");

    try {
      let result = await axios.post(`${serverUrl}/signup`, formData, {
        withCredentials: true
      });
      dispatch(setUserData(result.data));
      navigate("/profile");
      setLoading(false);
      setError("");
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(error?.response?.data?.message || "Signup failed ❌");
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
        className='w-full max-w-lg glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-cyan-500/20 text-slate-100 backdrop-blur-2xl'
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Join</span>
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              BaatCheet
            </span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">Create your free account to start messaging</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                maxLength={10}
                value={formData.name}
                onChange={handleChange}
                required
                className='w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition'
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className='w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition'
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="•••••••• (Min 6 chars)"
                value={formData.password}
                onChange={handleChange}
                required
                className='w-full pl-11 pr-11 py-3 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition'
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Security Question */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Security Question</label>
            <div className="relative">
              <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
                className='w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100 focus:outline-none transition appearance-none bg-[#090d18]'
              >
                <option value="" disabled className="text-slate-500">Select a Security Question</option>
                {securityQuestionsList.map((q, idx) => (
                  <option key={idx} value={q} className="bg-[#0e1322] text-slate-200">{q}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Security Answer */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Security Answer</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="securityAnswer"
                type="text"
                placeholder="Your secret answer"
                value={formData.securityAnswer}
                onChange={handleChange}
                required
                className='w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition'
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center'
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className='w-full py-3.5 rounded-xl font-bold text-white glow-button text-sm cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Free Account"
            )}
          </motion.button>

          {/* Switch to Login */}
          <p
            className="text-center text-sm text-slate-400 mt-2 cursor-pointer font-medium"
            onClick={() => navigate('/login')}
          >
            Already have an account?{" "}
            <span className="font-bold text-cyan-400 hover:text-cyan-300 transition hover:underline">
              Sign In
            </span>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;