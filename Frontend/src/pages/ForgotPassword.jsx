import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../config";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getQuestion = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${serverUrl}/get-security-question`, {
        email
      });
      setSecurityQuestion(res.data.securityQuestion);
      setStep(2);
    } catch (error) {
      alert(error?.response?.data?.message || "Error fetching security question");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    try {
      setLoading(true);
      await axios.post(`${serverUrl}/reset-password-question`, {
        email,
        securityAnswer,
        newPassword
      });
      alert("Password Updated Successfully");
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2 text-center text-[#0b2a5b]">
          Forgot Password
        </h1>

        {step === 1 && (
          <>
            <p className="text-gray-600 text-sm text-center mb-4">
              Enter your registered email address to retrieve your security question.
            </p>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[#f0fdfa] transition"
            />
            <button
              onClick={getQuestion}
              disabled={loading || !email}
              className="mt-4 bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 text-white w-full p-3 rounded-xl font-bold cursor-pointer hover:scale-[1.02] transition"
            >
              {loading ? "Loading..." : "Get Question"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-2 p-3 bg-gray-100 rounded-lg text-gray-700 font-medium">
              <span className="block text-sm text-gray-500 mb-1">Security Question:</span>
              {securityQuestion}
            </div>
            
            <input
              type="text"
              placeholder="Your Answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[#f0fdfa] transition"
            />
            
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[#f0fdfa] transition mt-2"
            />
            
            <button
              onClick={resetPassword}
              disabled={loading || !securityAnswer || !newPassword}
              className="mt-4 bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 text-white w-full p-3 rounded-xl font-bold cursor-pointer hover:scale-[1.02] transition"
            >
              {loading ? "Loading..." : "Reset Password"}
            </button>
          </>
        )}
        
        <p className="text-center text-sm text-gray-500 mt-2 cursor-pointer hover:underline" onClick={() => navigate('/login')}>
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;