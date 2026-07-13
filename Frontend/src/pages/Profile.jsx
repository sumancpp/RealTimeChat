import React, { useState } from "react"
import { motion } from "framer-motion"
import { Camera, ArrowLeft } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import defaultProfile from "../assets/profile.png"
import { serverUrl } from "../config"
import { setUserData } from "../redux/userSlice"

const Profile = () => {

    const userData = useSelector((state) => state.user.userData)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [selectedImage, setSelectedImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: userData?.name || "",
        userName: userData?.userName || "",
        email: userData?.email || ""
    })

    const handleImageChange = (e) => {

        const file = e.target.files[0]

        if (file) {
            setBackendImage(file)
            setSelectedImage(URL.createObjectURL(file))
        }
    }

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleProfile = async (e) => {

    e.preventDefault()

    setSaving(true)

    try {

        const updatedData = new FormData()

        updatedData.append("name", formData.name)

        if (backendImage) {
            updatedData.append("profileImage", backendImage)
        }

        let result = await axios.put(
            `${serverUrl}/user/profile`,
            updatedData,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )

        // Update Redux instantly
        dispatch(setUserData(result.data))

        // Update preview instantly
        if (result.data.profileImage) {
            setSelectedImage(result.data.profileImage)
        }

        setSaving(false)

        // Navigate AFTER everything updates
        navigate("/")

    } catch (error) {

        console.log(error)
        setSaving(false)

    }

}

    return (

        <div className="w-full min-h-screen bg-slate-200 flex items-center justify-center px-4 py-10">

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden"
            >

                {/* Header */}
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-[200px] bg-[#e6fffa] rounded-b-[30%] flex flex-col items-center justify-center relative"
                >

                    {/* Back Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate("/")}
                        className="absolute top-5 left-5 bg-white p-2 rounded-full shadow-md cursor-pointer"
                    >
                        <ArrowLeft size={22} className="text-gray-700" />
                    </motion.button>

                    {/* Profile Image */}
                    <div className="relative">

                        <img
                            src={
                                selectedImage ||
                                userData?.profileImage ||
                                defaultProfile
                            }
                            alt="profile"
                            className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                        />

                        {/* Upload Button */}
                        <label
                            htmlFor="profileUpload"
                            className="absolute bottom-1 right-1 bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 p-2 rounded-full cursor-pointer shadow-md"
                        >
                            <Camera size={18} className="text-white" />
                        </label>

                        <input
                            type="file"
                            id="profileUpload"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-[#0b2a5b]">
                        My Profile
                    </h2>

                </motion.div>

                {/* Form */}
                <motion.form
                    onSubmit={handleProfile}
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                    className="w-full flex flex-col gap-5 px-5 sm:px-8 py-8"
                >

                    {/* Full Name */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        className="flex flex-col gap-2"
                    >

                        <label className="font-semibold text-gray-700">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength={10}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-[#f0fdfa] focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />

                    </motion.div>

                    {/* Username */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        className="flex flex-col gap-2"
                    >

                        <label className="font-semibold text-gray-700">
                            Username
                        </label>

                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                        />

                    </motion.div>

                    {/* Gmail */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        className="flex flex-col gap-2"
                    >

                        <label className="font-semibold text-gray-700">
                            Gmail
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                        />

                    </motion.div>

                    {/* Save Button */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={saving}
                        // onClick={() => navigate("/")}
                        className="w-1/2 mx-auto py-3 rounded-xl font-bold text-white 
                        bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 
                        shadow-md mt-4 cursor-pointer disabled:opacity-70"
                    >

                        {saving ? "Saving..." : "Save Profile"}

                    </motion.button>

                </motion.form>

            </motion.div>

        </div>
    )
}

export default Profile