import React, {
  useEffect
} from "react";

import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import {
  useDispatch,
  useSelector
} from "react-redux";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

import getCurrentUser from "./custumHooks/getCurrentUser";
import getOtherUsers from "./custumHooks/getOtherUsers";

import {
  setOnlineUsers
} from "./redux/userSlice";

import {
  connectSocket,
  disconnectSocket,
  getSocket
} from "./socket";

const App = () => {

  getCurrentUser();

  getOtherUsers();

  const dispatch = useDispatch();

  const { userData } = useSelector(
    state => state.user
  );

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

      }
    );

    // DISCONNECT EVENT
    activeSocket.on(
      "disconnect",
      () => {

        console.log(
          "Socket Disconnected"
        );

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

  return (

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

    </Routes>

  );

};

export default App;