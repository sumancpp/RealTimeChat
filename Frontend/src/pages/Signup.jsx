import React, { useState } from 'react'
import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from "lucide-react"
import { serverUrl } from '../main'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const Signup = () => {

  let navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  let dispatch=useDispatch()
  

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: ""
  })

  
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Username validation
  if (!formData.userName) {
    setError("Username is required ❌")
    setLoading(false)
    return
  }

  // Email validation
  if (!emailRegex.test(formData.email)) {
    setError("Invalid email format ❌")
    setLoading(false)
    return
  }

  // Password validation
  if (!formData.password || formData.password.length < 6) {
    setError("Password must be at least 6 characters ❌")
    setLoading(false)
    return
  }

  setError("")

  try {
    let result = await axios.post(`${serverUrl}/signup`, formData, {
      withCredentials: true
    })
    dispatch(setUserData(result.data))
    navigate("/profile")
    setLoading(false)
    setError("")

    console.log("Signup success:", result.data)

  } catch (error) {
    console.log(error)

    setLoading(false)
    setError(error?.response?.data?.message || "Signup failed ❌")
  }

  console.log("Form Submitted:", formData)
}

  return (
    <div className='w-full min-h-screen bg-slate-200 flex items-center justify-center px-4'>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md sm:max-w-lg h-auto bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden'
      >

        {/* Header */}
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className='w-full h-[160px] sm:h-[200px] bg-[#e6fffa] rounded-b-[30%] shadow-md flex items-center justify-center'
        >
          <h1 className="text-3xl sm:text-5xl font-bold tracking-wide font-[Poppins]">
            <span className="text-[#0b2a5b]">Baat</span>
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              Cheet
            </span>
          </h1>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
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
          className='w-full flex flex-col gap-4 sm:gap-5 px-5 sm:px-8 py-6 items-center justify-center'
        >

          {[
            { name: "userName", type: "text", placeholder: "Enter username" },
            { name: "email", type: "email", placeholder: "Enter email" },
            { name: "password", type: "password", placeholder: "Enter password" }
          ].map((field, index) => {

            // Special case for password
            if (field.name === "password") {
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="w-full relative"
                >
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={field.placeholder}
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[#f0fdfa] transition'
                  />

                  {/* Eye Icon */}
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-orange-500 transition"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </motion.div>
              )
            }

            // 👉 Normal inputs
            return (
              <motion.input
                key={index}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[#f0fdfa] transition'
              />
            )
          })}


          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className='w-1/2 py-3 rounded-xl font-bold text-white 
            bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 
            shadow-md cursor-pointer mt-[20px]'
          >
            {loading?"Loading...":"Create Account"}
          </motion.button>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm sm:text-base text-gray-600 mt-2 cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Already have an account?{" "}

            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer font-semibold bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 bg-clip-text text-transparent hover:underline"
            >
              Login
            </motion.span>
          </motion.p>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm font-medium'
            >
              {error}
            </motion.p>
          )}

        </motion.form>

      </motion.div>
    </div>
  )
}

export default Signup