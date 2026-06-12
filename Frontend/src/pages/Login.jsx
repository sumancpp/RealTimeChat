import React, { useState } from 'react'
import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from "lucide-react"
import axios from 'axios'
import { serverUrl } from '../main'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const Login = () => {

  let navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  let dispatch = useDispatch()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

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

    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format ❌")
      setLoading(false)
      return
    }

    try {
      let result = await axios.post(`${serverUrl}/login`, formData, { withCredentials: true })
      dispatch(setUserData(result.data))
      navigate("/")
      setLoading(false)
      setError("")
    } catch (error) {
      console.log(error)
      setLoading(false)
      setError(error?.response?.data?.message || "Something went wrong ❌")
    }

    console.log("Login Data:", formData)
  }

  return (
    <div className='w-full min-h-screen bg-slate-200 flex items-center justify-center px-4'>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden'
      >

        {/* Header */}
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className='w-full h-[160px] sm:h-[200px] bg-[#e6fffa] rounded-b-[30%] flex items-center justify-center'
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
              transition: { staggerChildren: 0.15 }
            }
          }}
          className='w-full flex flex-col gap-4 sm:gap-5 px-5 sm:px-8 py-6 items-center justify-center'
        >

          {/* Email */}
          <motion.input
            name="email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[#f0fdfa]'
          />

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

          {/* Password with Eye */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="w-full relative"
          >
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[#f0fdfa]'
            />

            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-orange-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </motion.div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className='w-1/2 py-3 rounded-xl font-bold text-white 
            bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 
            shadow-md mt-3 cursor-pointer'
          >
            {loading ? "Loading..." : "Login"}
          </motion.button>

          <motion.p

            initial={{
              opacity: 0,
              y: 10
            }}

            animate={{
              opacity: 1,
              y: 0
            }}

            transition={{
              delay: 0.3,
              duration: 0.4
            }}

            whileHover={{
              scale: 1.05
            }}

            onClick={() =>
              navigate(
                "/forgot-password"
              )
            }

            className="
    text-sm
    text-orange-500
    font-medium
    cursor-pointer
    text-center
    w-full
    hover:underline
  "

          >

            Forgot Password?

          </motion.p>

          {/* Switch to Signup */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm sm:text-base text-gray-600 cursor-pointer"
            onClick={() => navigate('/signup')}
          >
            Don’t have an account?{" "}
            <span className="font-semibold bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 bg-clip-text text-transparent hover:underline">
              Signup
            </span>
          </motion.p>


        </motion.form>

      </motion.div>
    </div>
  )
}

export default Login