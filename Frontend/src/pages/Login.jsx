import React, { useState } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import axios from 'axios';
import { serverUrl } from '../config';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

const Login = () => {
  let navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  let dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

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

    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format ❌");
      setLoading(false);
      return;
    }

    try {
      let result = await axios.post(`${serverUrl}/login`, formData, { withCredentials: true });
      dispatch(setUserData(result.data));
      navigate("/");
      setLoading(false);
      setError("");
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(error?.response?.data?.message || "Something went wrong ❌");
    }
  };

  return (
    <div className='w-full min-h-screen bg-[#05070e] flex items-center justify-center px-4 py-8 relative overflow-hidden text-slate-100'>
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
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Baat</span>
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              Cheet
            </span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">Real-time messaging, WebRTC calls & games</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className='w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition'
              />
            </div>
          </div>

          {/* Password with Eye */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
              <span
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer transition font-semibold hover:underline"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className='w-full pl-12 pr-12 py-3.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition'
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
              "Sign In to BaatCheet"
            )}
          </motion.button>

          {/* Switch to Signup */}
          <p
            className="text-center text-sm text-slate-400 mt-2 cursor-pointer font-medium"
            onClick={() => navigate('/signup')}
          >
            Don’t have an account?{" "}
            <span className="font-bold text-cyan-400 hover:text-cyan-300 transition hover:underline">
              Create Free Account
            </span>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
