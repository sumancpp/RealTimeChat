import React, {
  useEffect
} from "react";

import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import InstallPrompt from "./components/InstallPrompt";
import CallManager from "./components/CallManager";

import {
  useDispatch,
  useSelector
} from "react-redux";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import About from "./pages/About";

import getCurrentUser from "./custumHooks/getCurrentUser";
import getOtherUsers from "./custumHooks/getOtherUsers";

import {
  setOnlineUsers,
  setSocketConnected
} from "./redux/userSlice";

import {
  connectSocket,
  disconnectSocket,
  getSocket
} from "./socket";

import { useState } from "react";
import SplashScreen from "./components/SplashScreen";

import ForgotPassword from "./pages/ForgotPassword";
import axios from "axios";
import { serverUrl } from "./config";

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

  getCurrentUser();

  getOtherUsers();

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  const { userData } = useSelector(
    state => state.user
  );

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setLoading(false);

      }, 1500);

    return () =>
      clearTimeout(timer);

  }, []);

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

  useEffect(() => {

    // USER NOT LOGGED IN
    if (!userData?._id) {

      disconnectSocket();

      return;

    }

    // CONNECT SOCKET
    connectSocket(
      userData._id
    );

    const activeSocket =
      getSocket();

    if (!activeSocket)
      return;

    // ONLINE USERS
    activeSocket.on(
      "getOnlineUsers",
      (users) => {

        dispatch(
          setOnlineUsers(users)
        );

      }
    );

    // CONNECT EVENT
    activeSocket.on(
      "connect",
      () => {

        console.log(
          "Socket Connected:",
          activeSocket.id
        );
        dispatch(setSocketConnected(true));

      }
    );

    // DISCONNECT EVENT
    activeSocket.on(
      "disconnect",
      () => {

        console.log(
          "Socket Disconnected"
        );
        dispatch(setSocketConnected(false));

      }
    );

    return () => {

      activeSocket.off(
        "getOnlineUsers"
      );

      activeSocket.off(
        "connect"
      );

      activeSocket.off(
        "disconnect"
      );

    };

  }, [
    userData,
    dispatch
  ]);

  if (loading) return <SplashScreen />;

  return (

    <>

      <InstallPrompt />
      <CallManager />

      <Routes>
        <Route
          path="/login"
          element={
            !userData
              ? <Login />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/signup"
          element={
            !userData
              ? <Signup />
              : <Navigate to="/profile" />
          }
        />

        <Route
          path="/"
          element={
            userData
              ? <Home />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/profile"
          element={
            userData
              ? <Profile />
              : <Navigate to="/signup" />
          }
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