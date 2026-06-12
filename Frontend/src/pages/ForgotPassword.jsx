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

const ForgotPassword = () => {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const sendOtp =
    async () => {

      try {

        setLoading(true);

        await axios.post(

          `${serverUrl}/forgot-password`,

          {
            email
          }

        );

        localStorage.setItem(
          "resetEmail",
          email
        );

        navigate(
          "/verify-otp"
        );

      }

      catch (error) {

        alert(

          error?.response?.data?.message

        );

      }

      finally {

        setLoading(false);

      }

    };

  return (

    <div className="min-h-screen flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl w-[350px] shadow">

        <h1 className="text-2xl font-bold mb-5">

          Forgot Password

        </h1>

        <input

          type="email"

          placeholder="Enter Email"

          value={email}

          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }

          className="border w-full p-3 rounded mb-4"

        />

        <button

          onClick={sendOtp}

          className="bg-orange-500 text-white w-full p-3 rounded cursor-pointer"

        >

          {

            loading

              ? "Sending..."

              : "Send OTP"

          }

        </button>

      </div>

    </div>

  );

};

export default ForgotPassword;