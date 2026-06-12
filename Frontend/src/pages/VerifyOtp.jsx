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

const VerifyOtp = () => {

  const navigate =
    useNavigate();

  const [otp, setOtp] =
    useState("");

  const verifyOtp =
    async () => {

      try {

        await axios.post(

          `${serverUrl}/verify-otp`,

          {

            email:
              localStorage.getItem(
                "resetEmail"
              ),

            otp

          }

        );

        navigate(
          "/reset-password"
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

          Verify OTP

        </h1>

        <input

          type="text"

          placeholder="Enter OTP"

          value={otp}

          onChange={(e) =>
            setOtp(
              e.target.value
            )
          }

          className="border w-full p-3 rounded mb-4"

        />

        <button

          onClick={verifyOtp}

          className="bg-orange-500 text-white w-full p-3 rounded cursor-pointer"

        >

          Verify OTP

        </button>

      </div>

    </div>

  );

};

export default VerifyOtp;