import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "./config";

import InstallPrompt from "./components/InstallPrompt";
import CallManager from "./components/CallManager";
import SplashScreen from "./components/SplashScreen";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import About from "./pages/About";
import ForgotPassword from "./pages/ForgotPassword";

import useGetOtherUsers from "./custumHooks/getOtherUsers";
import { setUserData, setOtherUsers, setOnlineUsers, setSocketConnected } from "./redux/userSlice";
import { connectSocket, disconnectSocket, getSocket } from "./socket";
import { initOfflineLLM } from "./services/offlineAiEngine";

function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array();
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const App = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { userData } = useSelector(state => state.user);

  useGetOtherUsers();

  // Instant Auth Check & Parallel Contact Pre-fetching
  useEffect(() => {
    let isMounted = true;
    const initAuthAndContacts = async () => {
      const startTime = Date.now();
      try {
        const userRes = await axios.get(`${serverUrl}/user/current`, { withCredentials: true });
        if (userRes.data && isMounted) {
          dispatch(setUserData(userRes.data));
          
          // Pre-fetch contacts instantly in parallel
          try {
            const usersRes = await axios.get(`${serverUrl}/message/sorted-users?t=${Date.now()}`, {
              withCredentials: true,
              timeout: 8000
            });
            if (usersRes.data && isMounted) {
              dispatch(setOtherUsers(usersRes.data));
            }
          } catch (err) {
            console.log("Pre-fetch users error:", err);
          }
        }
      } catch (error) {
        console.log("No active user session");
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingSplashTime = Math.max(0, 400 - elapsedTime);
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, remainingSplashTime);
      }
    };

    initAuthAndContacts();
    return () => { isMounted = false; };
  }, [dispatch]);

  // Auto-download 350MB On-Device Neural AI Model in background when online
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.onLine) {
      const timer = setTimeout(() => {
        initOfflineLLM((progress) => {
          if (progress?.status === "progress" && progress.total) {
            const pct = Math.round((progress.loaded / progress.total) * 100);
            console.log(`[BaatCheet AI] Auto-downloading neural model: ${pct}%`);
          }
        }).catch(() => {});
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Push Notifications Setup
  useEffect(() => {
    if (userData?._id && "serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then(async (registration) => {
        await navigator.serviceWorker.ready;
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
        if (Notification.permission === "granted") {
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey
            });
          }
          axios.post(`${serverUrl}/user/subscribe`, { subscription }, { withCredentials: true })
            .catch(err => console.log("Failed to subscribe push:", err));
        }
      }).catch(err => console.log("SW error:", err));
    }
  }, [userData?._id]);

  // Socket Connection Manager
  useEffect(() => {
    if (!userData?._id) {
      disconnectSocket();
      return;
    }

    connectSocket(userData._id);
    const activeSocket = getSocket();
    if (!activeSocket) return;

    activeSocket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    activeSocket.on("connect", () => {
      dispatch(setSocketConnected(true));
    });

    activeSocket.on("disconnect", () => {
      dispatch(setSocketConnected(false));
    });

    return () => {
      activeSocket.off("getOnlineUsers");
      activeSocket.off("connect");
      activeSocket.off("disconnect");
    };
  }, [userData, dispatch]);

  if (loading) return <SplashScreen />;

  return (
    <>
      <InstallPrompt />
      <CallManager />

      <Routes>
        <Route
          path="/login"
          element={!userData ? <Login /> : <Navigate to="/" />}
        />

        <Route
          path="/signup"
          element={!userData ? <Signup /> : <Navigate to="/profile" />}
        />

        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={userData ? <Profile /> : <Navigate to="/signup" />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/about"
          element={<About />}
        />
      </Routes>
    </>
  );
};

export default App;