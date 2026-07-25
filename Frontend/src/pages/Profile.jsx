import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, ArrowLeft, User, Mail, AtSign, Check, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultProfile from "../assets/profile.png";
import { serverUrl } from "../config";
import { setUserData } from "../redux/userSlice";

const Profile = () => {
    const userData = useSelector((state) => state.user.userData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(null);
    const [backendImage, setBackendImage] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: userData?.name || "",
        userName: userData?.userName || "",
        email: userData?.email || ""
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackendImage(file);
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updatedData = new FormData();
            updatedData.append("name", formData.name);

            if (backendImage) {
                updatedData.append("profileImage", backendImage);
            }

            let result = await axios.put(
                `${serverUrl}/user/profile`,
                updatedData,
                { withCredentials: true }
            );

            dispatch(setUserData(result.data));

            if (result.data.profileImage) {
                setSelectedImage(result.data.profileImage);
            }

            setSaving(false);
            navigate("/");
        } catch (error) {
            console.log(error);
            setSaving(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#05070e] flex items-center justify-center px-4 py-10 relative overflow-hidden text-slate-100">
            {/* Cyber Ambient Glowing Blobs */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-glow pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-glow pointer-events-none" style={{ animationDelay: '2.5s' }} />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-cyan-500/20 text-slate-100 backdrop-blur-2xl"
            >
                {/* Banner / Header */}
                <div className="w-full h-44 bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 relative flex flex-col items-center justify-center border-b border-cyan-500/20 shadow-md">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate("/")}
                        className="absolute top-5 left-5 p-2.5 rounded-2xl bg-[#090d18]/80 text-slate-200 hover:text-white shadow-md backdrop-blur-md cursor-pointer transition border border-cyan-500/30"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>

                    {/* Profile Avatar */}
                    <div className="relative mt-8">
                        <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-r from-cyan-400 to-fuchsia-400 shadow-2xl">
                            <img
                                src={selectedImage || userData?.profileImage || defaultProfile}
                                alt="profile"
                                className="w-full h-full rounded-full object-cover bg-[#090d18]"
                            />
                        </div>

                        <label
                            htmlFor="profileUpload"
                            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white cursor-pointer shadow-lg transition border-2 border-[#090d18]"
                        >
                            <Camera size={16} />
                        </label>
                        <input
                            type="file"
                            id="profileUpload"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>

                <div className="text-center mt-12 px-6">
                    <h2 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
                        {userData?.name || "User Profile"}
                        <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">Manage your personal details & avatar</p>
                </div>

                {/* Form */}
                <form onSubmit={handleProfile} className="flex flex-col gap-4 px-6 sm:px-8 py-6">
                    {/* Full Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                maxLength={10}
                                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition font-medium"
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Username (Fixed)</label>
                        <div className="relative">
                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName}
                                readOnly
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#090d18]/60 border border-slate-800 text-slate-400 text-sm cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>

                    {/* Gmail */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#090d18]/60 border border-slate-800 text-slate-400 text-sm cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={saving}
                        className="w-full py-3.5 rounded-xl font-bold text-white glow-button text-sm cursor-pointer mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={18} /> Save Profile Changes
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;