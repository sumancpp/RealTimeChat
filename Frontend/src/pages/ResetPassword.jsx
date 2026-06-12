import React, {
  useState
} from "react";

import axios from "axios";

import {
  useNavigate
} from "react-router-dom";

import {
  serverUrl
} from "../main";

const ResetPassword = () => {

  const navigate =
    useNavigate();

  const [password,
    setPassword] =
      useState("");

  const [otp,
    setOtp] =
      useState("");

  const resetPassword =
    async () => {

      try {

        await axios.post(

          `${serverUrl}/reset-password`,

          {

            email:
              localStorage.getItem(
                "resetEmail"
              ),

            otp,

            password

          }

        );

        localStorage.removeItem(
          "resetEmail"
        );

        alert(
          "Password Updated"
        );

        navigate(
          "/login"
        );

      }

      catch (error) {

        alert(

          error?.response?.data?.message

        );

      }

    };

  return (

    <div className="min-h-screen flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl w-[350px] shadow">

        <h1 className="text-2xl font-bold mb-5">

          Reset Password

        </h1>

        <input

          type="text"

          placeholder="OTP"

          value={otp}

          onChange={(e) =>
            setOtp(
              e.target.value
            )
          }

          className="border w-full p-3 rounded mb-3"

        />

        <input

          type="password"

          placeholder="New Password"

          value={password}

          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }

          className="border w-full p-3 rounded mb-4"

        />

        <button

          onClick={
            resetPassword
          }

          className="bg-orange-500 text-white w-full p-3 rounded cursor-pointer"

        >

          Update Password

        </button>

      </div>

    </div>

  );

};

export default ResetPassword;