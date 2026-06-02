import React, {
  useState,
  useRef,
  useEffect
} from "react";

import {
  SendHorizonal,
  ArrowLeft,
  Smile,
  ImagePlus
} from "lucide-react";

import axios from "axios";

import EmojiPicker from "emoji-picker-react";

import defaultProfile from "../assets/profile.png";

import { serverUrl } from "../main";

import {
  useDispatch,
  useSelector
} from "react-redux";

import { socket } from "../socket";

import {
  setSelectedUser
} from "../redux/userSlice";

const MessageArea = () => {

  const dispatch = useDispatch();

  const {
    selectedUser,
    userData
  } = useSelector(
    (state) => state.user
  );

  const { messages } = useSelector(
    (state) => state.message
  );

  const [showPicker, setShowPicker] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [frontendImage, setFrontendImage] =
    useState(null);

  const [backendImage, setBackendImage] =
    useState(null);

  const [sending, setSending] =
    useState(false);

  const [isTyping, setIsTyping] =
    useState(false);

  const { onlineUsers } =
    useSelector(
      state => state.user
    );

  const pickerRef = useRef(null);

  const fileInputRef = useRef(null);

  const messageContainerRef = useRef(null);

  const bottomRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);

  useEffect(() => {

    if (!socket) return;

    socket.on(
      "typing",
      () => {

        setIsTyping(true);

      }
    );

    socket.on(
      "stopTyping",
      () => {

        setIsTyping(false);

      }
    );

    return () => {

      socket.off("typing");

      socket.off("stopTyping");

    };

  }, []);

  // CLOSE EMOJI PICKER
  useEffect(() => {

    const handleClickOutside = (
      event
    ) => {

      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target
        )
      ) {

        setShowPicker(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  useEffect(() => {

    if (
      selectedUser &&
      socket
    ) {

      socket.emit(
        "markMessagesSeen",
        {

          senderId:
            selectedUser._id

        }
      );

    }

  }, [selectedUser]);

  // SEND MESSAGE
  const handleSendMessage = async (
    e
  ) => {

    e.preventDefault();

    if (
      (!message.trim() &&
        !backendImage) ||
      sending
    ) {
      return;
    }

    try {

      setSending(true);

      const formData =
        new FormData();

      formData.append(
        "message",
        message
      );

      if (backendImage) {

        formData.append(
          "image",
          backendImage
        );

      }

      // CLEAR UI INSTANTLY
      setMessage("");

      setFrontendImage(null);

      setBackendImage(null);

      if (fileInputRef.current) {

        fileInputRef.current.value =
          "";

      }

      await axios.post(

        `${serverUrl}/message/send/${selectedUser._id}`,

        formData,

        {

          withCredentials: true,

          headers: {

            "Content-Type":
              "multipart/form-data"

          }

        }

      );

    } catch (error) {

      console.log(error);

    } finally {

      setSending(false);

    }

  };

  // FILE CHANGE
  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setBackendImage(file);

    setFrontendImage(
      URL.createObjectURL(file)
    );

  };

  // EMOJI
  const onEmojiClick = (
    emojiObject
  ) => {

    setMessage(
      (prev) =>
        prev + emojiObject.emoji
    );

  };

  return (

    <div className="w-full h-screen flex flex-col bg-[#efeae2]">

      {selectedUser ? (

        <>

          {/* HEADER */}
          <div className="w-full min-h-[70px] bg-white border-b sticky top-0 z-50 border-gray-300 flex items-center px-4 shadow-sm">

            <button
              onClick={() =>
                dispatch(
                  setSelectedUser(null)
                )
              }
              className="lg:hidden mr-3"
            >

              <ArrowLeft
                size={24}
                className="text-gray-700"
              />

            </button>

            <img
              src={
                selectedUser?.profileImage ||
                defaultProfile
              }
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="ml-3">

              <h2 className="text-lg font-semibold text-[#0b2a5b]">

                {
                  selectedUser?.name ||
                  selectedUser?.userName
                }

              </h2>

              <p className="text-xs text-gray-500">

                {
                  onlineUsers.includes(
                    selectedUser._id
                  )

                    ? isTyping
                      ? "Typing..."
                      : "Online"

                    : selectedUser.lastSeen

                      ? `Last seen ${new Date(
                        selectedUser.lastSeen
                      ).toLocaleTimeString()}`

                      : "Offline"
                }

              </p>

            </div>

          </div>

          {/* MESSAGES */}
          <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto px-4 py-5"
          >

            {messages?.map(
              (msg, index) => (

                <div
                  key={
                    msg._id || index
                  }
                  className={`flex mb-4 ${msg.sender?.toString() ===
                    userData?._id?.toString()
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >

                  <div
                    className={`p-2 rounded-2xl max-w-[80%] sm:max-w-[70%] shadow-sm ${msg.sender?.toString() ===
                      userData?._id?.toString()
                      ? "bg-[#d9fdd3]"
                      : "bg-white"
                      }`}
                  >

                    {/* IMAGE */}
                    {msg.image && (

                      <img
                        src={msg.image}
                        alt="chat"
                        className="w-full rounded-xl mb-2"
                      />

                    )}

                    {/* MESSAGE */}
                    <div className="flex items-end gap-1">

                      {msg.message && (



                        <p
                          className="text-gray-800
                                break-words
                                whitespace-pre-wrap
                                "
                        >
                          {msg.message}
                        </p>



                      )}

                      {
                        msg.sender?.toString() ===
                        userData?._id?.toString() && (

                          <span
                            className={`text-xs font-bold mb-[2px]

                ${msg.isSeen

                                ? "text-blue-500"

                                : "text-gray-500"
                              }`}
                          >

                            {
                              msg.isSeen
                                ? "✓✓"
                                : "✓"
                            }

                          </span>

                        )
                      }

                    </div>


                  </div>

                </div>

              )
            )}

            <div ref={bottomRef}></div>

          </div>

          {/* IMAGE PREVIEW */}
          {frontendImage && (

            <div className="px-4 py-2">

              <img
                src={frontendImage}
                alt="preview"
                className="w-32 h-32 rounded-lg object-cover"
              />

            </div>

          )}

          {/* INPUT */}
          <div className="relative">

            {showPicker && (

              <div
                ref={pickerRef}
                className="absolute bottom-20 left-2 z-50"
              >

                <EmojiPicker
                  onEmojiClick={
                    onEmojiClick
                  }
                />

              </div>

            )}

            <form
              onSubmit={
                handleSendMessage
              }
              className="w-full bg-white px-2 sm:px-3 py-2 border-t border-gray-300 flex items-end gap-2"
            >

              {/* EMOJI */}
              <button
                type="button"
                onClick={() =>
                  setShowPicker(
                    (prev) => !prev
                  )
                }
              >

                <Smile size={22} />

              </button>

              {/* IMAGE */}
              <label className="cursor-pointer">

                <ImagePlus size={22} />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleFileChange
                  }
                />

              </label>

              {/* INPUT */}
              <textarea
                type="text"
                value={message}
                rows={1}
                style={{
                  height: "44px"
                }}
                onChange={(e) => {

                  setMessage(
                    e.target.value
                  );

                  socket?.emit(
                    "typing",
                    {
                      receiverId:
                        selectedUser._id
                    }
                  );

                  setTimeout(() => {

                    socket?.emit(
                      "stopTyping",
                      {
                        receiverId:
                          selectedUser._id
                      }
                    );

                  }, 1000);

                }}
                placeholder="Type a message"
                className="
flex-1
min-w-0
resize-none
max-h-32
px-4
py-3
rounded-3xl
bg-slate-100
outline-none
overflow-y-auto
text-sm
"
              />

              {/* SEND */}
              <button
                type="submit"
                disabled={sending}
                className={`
    flex-shrink-0
    w-11
    h-11
    sm:w-12
    sm:h-12
    rounded-full
    flex
    items-center
    justify-center
    text-white
    transition-all
    ${sending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                  }
  `}
              >
                <SendHorizonal size={18} />
              </button>

            </form>

          </div>

        </>

      ) : (

        <div className="hidden lg:flex flex-1 items-center justify-center flex-col">

          <h1 className="text-7xl font-bold">

            <span className="text-[#0b2a5b]">
              Baat
            </span>

            <span className="text-orange-500">
              Cheet
            </span>

          </h1>

          <p className="text-gray-500 mt-4">

            Select a chat to start messaging

          </p>

        </div>

      )}

    </div>

  );

};

export default MessageArea;