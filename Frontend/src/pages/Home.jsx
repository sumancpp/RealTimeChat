import React, { useEffect } from 'react';

import SideBar from '../components/SideBar';
import MessageArea from '../components/MessageArea';

import useGetMessages from '../custumHooks/getMessages';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  setSelectedUser
} from '../redux/userSlice';

const Home = () => {

  const dispatch = useDispatch();

  const { selectedUser } = useSelector(
    state => state.user
  );

  useGetMessages();

  useEffect(() => {
    if (selectedUser && !window.history.state?.chatOpen) {
      window.history.pushState({ chatOpen: true }, "");
    }
  }, [selectedUser]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (selectedUser && !e.state?.chatOpen) {
        dispatch(setSelectedUser(null));
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedUser, dispatch]);

  return (
    <div className='w-full h-screen h-[100dvh] flex overflow-hidden bg-[#05070e]'>

      {/* Sidebar */}
      <div
        className={`
          ${selectedUser ? "hidden lg:block" : "block"}
          w-full lg:w-[30%] h-full overflow-hidden
        `}
      >

        <SideBar />

      </div>

      {/* Message Area */}
      <div
        className={`
          ${selectedUser ? "flex flex-col" : "hidden lg:flex lg:flex-col"}
          w-full lg:w-[70%] h-full overflow-hidden relative
        `}
      >

        <MessageArea />

      </div>

    </div>

  )

}

export default Home;