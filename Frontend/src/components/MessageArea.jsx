import React, {
  useState,
  useRef,
  useEffect
} from "react";

import {
  SendHorizonal,
  ArrowLeft,
  Smile,
  ImagePlus,
  Plus,
  Trash2,
  Mic,
  Square,
  Phone,
  Video,
  MoreVertical,
  Ban,
  Edit3,
  Lock,
  Timer
} from "lucide-react";

import axios from "axios";

import EmojiPicker from "emoji-picker-react";

import defaultProfile from "../assets/profile.png";

import { serverUrl } from "../config";

import {
  useDispatch,
  useSelector
} from "react-redux";

import { socket } from "../socket";

import {
  updateReaction,
  deleteMessageRedux,
  addMessage
} from "../redux/messageSlice";

import {
  setSelectedUser,
  setOtherUsers,
  updateOtherUser,
  setUserData
} from "../redux/userSlice";

import GroupInfoModal from "./GroupInfoModal";

const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const now = new Date();
    const lastSeen = new Date(date);
    const diff = Math.floor((now - lastSeen) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `Last seen ${diff}m ago`;
    const timeString = lastSeen.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    if (now.toDateString() === lastSeen.toDateString()) {
        return `Last seen today at ${timeString}`;
    }
    
    const dateString = lastSeen.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `Last seen ${dateString} at ${timeString}`;
};

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

  const [replyMessage, setReplyMessage] =
    useState(null);

  const [editingMessageId, setEditingMessageId] = useState(null);

  useEffect(() => {

    console.log(
      "Reply State Changed:",
      replyMessage
    );

  }, [replyMessage]);

  const [frontendImage, setFrontendImage] =
    useState(null);

  const [backendImage, setBackendImage] =
    useState(null);

  const [sending, setSending] =
    useState(false);

  const [isTyping, setIsTyping] =
    useState(false);

  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDisappearingMenu, setShowDisappearingMenu] = useState(false);

  const { onlineUsers } =
    useSelector(
      state => state.user
    );

  const pickerRef = useRef(null);
  const menuRef = useRef(null);

  const fileInputRef = useRef(null);

  const messageContainerRef = useRef(null);

  const bottomRef = useRef(null);

  const [activeReactionMessage, setActiveReactionMessage] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);



  const [recordingMode,
    setRecordingMode] =
    useState(false);

  const [isViewOnce, setIsViewOnce] = useState(false);

  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  // AUTO SCROLL
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);

  // CLEAR INPUTS ON USER SWITCH
  useEffect(() => {
    setMessage("");
    setReplyMessage(null);
    setEditingMessageId(null);
    setFrontendImage(null);
    setBackendImage(null);
    setIsViewOnce(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedUser]);

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

  useEffect(() => {

    const closeReactionPicker =
      () => {

        setActiveReactionMessage(
          null
        );

      };

    document.addEventListener(
      "click",
      closeReactionPicker
    );

    return () => {

      document.removeEventListener(
        "click",
        closeReactionPicker
      );

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

  // CLOSE MENU ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
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
            selectedUser._id,
          receiverId:
            userData._id
        }
      );

    }

  }, [selectedUser]);

  const sendVoiceMessage =
    async (
      audioBlob
    ) => {

      try {

        const formData =
          new FormData();

        formData.append(

          "file",

          new File(

            [audioBlob],

            "voice.webm",

            {
              type:
                "audio/webm"
            }

          )

        );

        const endpoint = selectedUser.isGroup ? `${serverUrl}/group/send/${selectedUser._id}` : `${serverUrl}/message/send/${selectedUser._id}`;
        await axios.post(

          endpoint,

          formData,

          {

            withCredentials:
              true

          }

        );

        if (res.data) {
          if (res.data._id) {
            dispatch(addMessage(res.data));
          }
        }

      }

      catch (error) {

        console.log(error);

      }

    };

  // start recording

  const recordingRef = useRef(false);

  const startRecording =
    async () => {
      if (recordingRef.current) return;

      recordingRef.current = true;
      try {

        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({

              audio: true

            });

        const mediaRecorder =
          new MediaRecorder(
            stream
          );

        mediaRecorderRef.current =
          mediaRecorder;

        audioChunksRef.current =
          [];

        mediaRecorder.onstart =
          () => {

            console.log(
              "Recording Started"
            );

          };

        mediaRecorder.ondataavailable =
          (event) => {

            console.log(
              "Chunk Size:",
              event.data.size
            );

            if (
              event.data.size > 0
            ) {

              audioChunksRef.current.push(
                event.data
              );

            }

          };

        mediaRecorder.onstop =
          async () => {

            const audioBlob =
              new Blob(

                audioChunksRef.current,

                {
                  type:
                    "audio/webm"
                }

              );

            console.log(
              "Voice Size:",
              audioBlob.size
            );

            await sendVoiceMessage(
              audioBlob
            );

          };

        mediaRecorder.start(1000);

        setRecordingMode(
          true
        );

      }

      catch (error) {

        console.log(error);

      }

    };

  // stop recording

  const stopRecording = () => {

    recordingRef.current = false;

    if (

      mediaRecorderRef.current &&

      mediaRecorderRef.current.state === "recording"

    ) {

      mediaRecorderRef.current.stop();

    }

    setRecordingMode(false);

  };





  // SEND MESSAGE
  const handleSendMessage = async (e) => {

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

      if (editingMessageId) {
          const res = await axios.put(`${serverUrl}/message/edit/${editingMessageId}`, { newContent: message }, { withCredentials: true });
          if (res.data) {
              dispatch(editMessageRedux(res.data));
          }
          setMessage("");
          setEditingMessageId(null);
          return;
      }

      const currentReply =
        replyMessage;

      const formData =
        new FormData();

      formData.append(
        "message",
        message
      );

      if (currentReply) {
        formData.append(
          "replyTo",
          currentReply._id
        );
        console.log("CURRENT REPLY:", currentReply);
      }

      if (backendImage) {
        formData.append(
          "file",
          backendImage
        );
      }

      if (isViewOnce) {
        formData.append("isViewOnce", true);
      }

      const endpoint = selectedUser.isGroup ? `${serverUrl}/group/send/${selectedUser._id}` : `${serverUrl}/message/send/${selectedUser._id}`;
      const res = await axios.post(

        endpoint,

        formData,

        {
          withCredentials: true,

          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }

      );

      if (res.data) {
        if (res.data.aiMessage) {
          dispatch(addMessage(res.data.message));
          dispatch(addMessage(res.data.aiMessage));
        } else if (res.data._id) {
          dispatch(addMessage(res.data));
        }
      }

      // CLEAR AFTER SUCCESS
      setMessage("");

      setReplyMessage(null);

      setFrontendImage(null);

      setBackendImage(null);
      setIsViewOnce(false);

      if (fileInputRef.current) {

        fileInputRef.current.value =
          "";

      }

    }

    catch (error) {

      console.log(error);

    }

    finally {

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

  useEffect(() => {

    if (!socket)
      return;

    socket.on(
      "messageReaction",
      (updatedMessage) => {

        dispatch(
          updateReaction(
            updatedMessage
          )
        );

      }
    );

    socket.on(
      "messageDeleted",
      ({ messageId }) => {

        dispatch(
          deleteMessageRedux(
            messageId
          )
        );

      }
    );

    return () => {

      socket.off(
        "messageReaction"
      );

      socket.off(
        "messageDeleted"
      );

    };

  }, [dispatch]);

  const reactToMessage =
    async (
      messageId,
      emoji
    ) => {

      try {

        await axios.post(

          `${serverUrl}/message/react/${messageId}`,

          {
            emoji
          },

          {
            withCredentials:
              true
          }

        );

      }

      catch (error) {

        console.log(
          error
        );

      }

    };

  const deleteMessageForEveryone =
    async (
      messageId
    ) => {

      try {

        await axios.delete(

          `${serverUrl}/message/delete/${messageId}`,

          {
            withCredentials: true
          }

        );

      }

      catch (error) {

        console.log(error);

      }

    };

  const handleBlockToggle = async () => {
      try {
          const isBlocked = userData?.blockedUsers?.includes(selectedUser._id);
          const endpoint = isBlocked ? `/user/unblock/${selectedUser._id}` : `/user/block/${selectedUser._id}`;
          const res = await axios.post(`${serverUrl}${endpoint}`, {}, { withCredentials: true });
          if (res.data) {
              dispatch(setUserData(res.data));
          }
          setShowMenu(false);
      } catch (error) {
          console.log(error);
      }
  };

  const handleLockToggle = async () => {
    try {
      const isLocked = userData?.lockedChats?.includes(selectedUser._id);
      
      if (!isLocked) {
         if (!userData?.chatLockPin) {
             const pin = prompt("Create a 4-digit PIN to lock this chat:");
             if (pin && pin.length >= 4) {
                 await axios.post(`${serverUrl}/user/chat-lock/setup`, { pin }, { withCredentials: true });
             } else {
                 alert("PIN must be at least 4 digits.");
                 return;
             }
         }
         const res = await axios.post(`${serverUrl}/user/chat-lock/lock/${selectedUser._id}`, {}, { withCredentials: true });
         dispatch(setUserData(res.data));
         dispatch(updateOtherUser({ _id: selectedUser._id, isLocked: true }));
         dispatch(setSelectedUser({ ...selectedUser, isLocked: true }));
         alert("Chat locked securely!");
      } else {
         const res = await axios.post(`${serverUrl}/user/chat-lock/unlock/${selectedUser._id}`, {}, { withCredentials: true });
         dispatch(setUserData(res.data));
         dispatch(updateOtherUser({ _id: selectedUser._id, isLocked: false }));
         dispatch(setSelectedUser({ ...selectedUser, isLocked: false }));
         alert("Chat unlocked.");
      }
      setShowMenu(false);
    } catch (error) {
       console.log(error);
    }
  };

  const handleSetDisappearing = async (timer) => {
      try {
          const res = await axios.put(`${serverUrl}/message/disappearing/${selectedUser._id}`, { timer }, { withCredentials: true });
          dispatch(updateOtherUser({ _id: selectedUser._id, disappearingTimer: timer }));
          dispatch(setSelectedUser({ ...selectedUser, disappearingTimer: timer }));
          alert(`Disappearing messages set to ${timer > 0 ? timer + ' hours' : 'Off'}`);
          setShowDisappearingMenu(false);
          setShowMenu(false);
      } catch (error) {
          console.log(error);
      }
  };

  const handleDeleteChat = async (deleteForEveryone = false) => {
      try {
          await axios.delete(`${serverUrl}/message/conversation/${selectedUser._id}`, { 
              data: { deleteForEveryone },
              withCredentials: true 
          });
          dispatch(setSelectedUser(null));
      } catch (error) {
          console.log(error);
      }
  };

  return (

    <div className="w-full h-screen flex flex-col bg-[#efeae2]">

      {selectedUser ? (

        <>

          {/* HEADER */}
          <div className="w-full min-h-[70px] bg-white border-b sticky top-0 z-50 border-gray-300 flex items-center px-4 shadow-sm">

            <button
              onClick={() => {
                if (window.history.state?.chatOpen) {
                  window.history.back();
                } else {
                  dispatch(setSelectedUser(null));
                }
              }}
              className="lg:hidden mr-3"
            >

              <ArrowLeft
                size={24}
                className="text-gray-700"
              />

            </button>

            <img
              src={
                (selectedUser?.isGroup ? selectedUser?.groupProfileImage : selectedUser?.profileImage) ||
                defaultProfile
              }
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div 
              className={`ml-3 ${selectedUser?.isGroup ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors' : ''}`}
              onClick={() => {
                  if (selectedUser?.isGroup) {
                      setShowGroupInfo(true);
                  }
              }}
            >

              <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#0b2a5b]">
                    {
                      selectedUser?.isGroup 
                        ? selectedUser.groupName 
                        : (selectedUser?.name || selectedUser?.userName)
                    }
                  </h2>
                  {selectedUser?.disappearingTimer > 0 && (
                      <Timer size={14} className="text-blue-500" />
                  )}
              </div>

              <p className="text-xs text-gray-500">

                {
                  selectedUser?.isGroup 
                    ? `${selectedUser.participants?.length || 0} participants`
                    : (onlineUsers.includes(selectedUser._id) || selectedUser.isAI || selectedUser.userName === "ai")
                      ? isTyping
                        ? "Typing..."
                        : "Online"
                      : formatLastSeen(selectedUser.lastSeen)
                }

              </p>

            </div>

            {/* CALL BUTTONS (Only for 1-on-1 for now) */}
            {!selectedUser?.isGroup && (
              <div ref={menuRef} className="ml-auto flex items-center gap-4 text-gray-500 relative">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('startCall', { detail: { userToCall: selectedUser, type: 'video' } }))}
                  className="hover:text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors"
                >
                  <Video size={24} />
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('startCall', { detail: { userToCall: selectedUser, type: 'voice' } }))}
                  className="hover:text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors"
                >
                  <Phone size={22} />
                </button>
                <button 
                  onClick={() => setShowMenu(!showMenu)} 
                  className="hover:text-gray-700 hover:bg-gray-50 p-2 rounded-full transition-colors"
                >
                  <MoreVertical size={24} />
                </button>

                {showMenu && (
                  <div className="absolute top-12 right-0 bg-white border border-gray-200 shadow-lg rounded-lg w-48 z-50 flex flex-col overflow-hidden">
                    <button onClick={handleBlockToggle} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <Ban size={16} className={userData?.blockedUsers?.includes(selectedUser._id) ? "text-green-500" : "text-red-500"} />
                        {userData?.blockedUsers?.includes(selectedUser._id) ? "Unblock" : "Block"}
                    </button>
                    <button onClick={handleLockToggle} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100">
                        <Lock size={16} className={userData?.lockedChats?.includes(selectedUser._id) ? "text-green-500" : "text-gray-500"} />
                        {userData?.lockedChats?.includes(selectedUser._id) ? "Unlock Chat" : "Lock Chat"}
                    </button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setShowDisappearingMenu(!showDisappearingMenu)} 
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between border-t border-gray-100"
                        >
                            <div className="flex items-center gap-2">
                                <Timer size={16} className="text-blue-500" /> Disappearing Messages
                            </div>
                            <span className="text-[10px] text-gray-400">▶</span>
                        </button>
                        {showDisappearingMenu && (
                            <div className="absolute top-0 right-full mr-1 bg-white border border-gray-200 shadow-lg rounded-lg w-32 z-50 overflow-hidden">
                                <button onClick={() => handleSetDisappearing(0)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Off</button>
                                <button onClick={() => handleSetDisappearing(24)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100">24 hours</button>
                                <button onClick={() => handleSetDisappearing(168)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100">7 days</button>
                                <button onClick={() => handleSetDisappearing(2160)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100">90 days</button>
                            </div>
                        )}
                    </div>

                    <button onClick={() => handleDeleteChat(false)} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100">
                        <Trash2 size={16} /> Delete for me
                    </button>
                    <button onClick={() => handleDeleteChat(true)} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100">
                        <Trash2 size={16} /> Delete for everyone
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          <GroupInfoModal 
             isOpen={showGroupInfo}
             onClose={() => setShowGroupInfo(false)}
             group={selectedUser}
          />

          {/* MESSAGES */}
          <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto px-4 py-5"
            onClick={() =>
              setActiveReactionMessage(
                null
              )
            }
          >

            {Array.isArray(messages) && messages.map(
              (msg, index) => {
                  if (msg.isSystemMessage) {
                      return (
                          <div key={msg._id || index} className="flex justify-center my-4 w-full">
                              <div className="text-[11px] font-medium bg-[#f2f2f2] text-[#54656f] px-3 py-1 rounded-lg text-center shadow-sm max-w-[85%]">
                                  {msg.message}
                              </div>
                          </div>
                      );
                  }

                return (
                <div
                  key={
                    msg._id || index
                  }
                  className={`flex mb-4 ${(msg.sender?._id || msg.sender)?.toString() ===
                    userData?._id?.toString()
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >

                  <div

                    onDoubleClick={() => {

                      setReplyMessage(msg);

                    }}

                    onClick={(e) => {

                      e.stopPropagation();

                      setActiveReactionMessage(

                        activeReactionMessage === msg._id

                          ? null

                          : msg._id

                      );

                    }}



                    className={`relative p-2 rounded-2xl max-w-[80%] sm:max-w-[70%] shadow-sm ${(msg.sender?._id || msg.sender)?.toString() ===
                      userData?._id?.toString()
                      ? "bg-[#d9fdd3]"
                      : "bg-white"
                      }`}

                  >
                  
                  {selectedUser?.isGroup && (msg.sender?._id || msg.sender)?.toString() !== userData?._id?.toString() && (
                      <p className="text-xs font-bold text-orange-500 mb-1">
                          {msg.sender?.name || msg.sender?.userName || "Someone"}
                      </p>
                  )}

                    {msg.replyTo && (

                      <div
                        className="
        border-l-4
        border-orange-500
        bg-gray-100
        rounded-lg
        px-3
        py-2
        mb-2
        "
                      >

                        <p className="text-xs text-orange-500 font-semibold mb-1">

                          Replying to {msg.replyTo.sender?.toString() === userData?._id?.toString() ? "You" : (selectedUser?.name || selectedUser?.userName || "Someone")}

                        </p>

                        <p className="text-sm truncate">

                          {
                            msg.replyTo.message ||

                            (msg.replyTo.image
                              ? "📷 Image"
                              : msg.replyTo.voice
                                ? "🎤 Voice Message"
                                : "")
                          }

                        </p>

                      </div>

                    )}

                    {/* IMAGE */}
                    {msg.image && (
                      msg.isViewOnce ? (
                        msg.viewOnceSeen ? (
                           <div className="flex items-center gap-2 italic text-gray-500 py-1">
                               <Timer size={14} /> Opened
                           </div>
                        ) : (
                           <div 
                              onClick={async () => {
                                 if (msg.sender?.toString() !== userData?._id?.toString()) {
                                     setSelectedImage(msg.image);
                                     await axios.put(`${serverUrl}/message/view-once/${msg._id}`, {}, { withCredentials: true });
                                 } else {
                                     alert("You sent this view once photo.");
                                 }
                              }}
                              className="flex items-center gap-2 cursor-pointer bg-blue-100 text-blue-600 px-3 py-2 rounded-xl mb-2 font-semibold shadow-sm w-max"
                           >
                               <ImagePlus size={16} /> Photo (View Once)
                           </div>
                        )
                      ) : (
                        <img
                          src={msg.image}
                          alt="chat"
                          onClick={() => setSelectedImage(msg.image)}
                          className="max-w-[200px] sm:max-w-[250px] max-h-[250px] rounded-xl object-cover mb-2 cursor-pointer hover:opacity-90 transition"
                        />
                      )
                    )}

                    {msg.voice && (
                      msg.isViewOnce ? (
                        msg.viewOnceSeen ? (
                           <div className="flex items-center gap-2 italic text-gray-500 py-1">
                               <Timer size={14} /> Opened
                           </div>
                        ) : (
                           <div 
                              className="flex flex-col gap-2 bg-blue-100 text-blue-600 px-3 py-2 rounded-xl mb-2 w-max shadow-sm"
                           >
                               <div className="flex items-center gap-2 font-semibold">
                                 <Mic size={16} /> Voice (View Once)
                               </div>
                               {msg.sender?.toString() !== userData?._id?.toString() ? (
                                   <audio
                                     controls
                                     src={msg.voice}
                                     className="w-[200px]"
                                     onEnded={async () => {
                                         await axios.put(`${serverUrl}/message/view-once/${msg._id}`, {}, { withCredentials: true });
                                     }}
                                   />
                               ) : (
                                   <span className="text-xs text-gray-500">You sent this view once voice message.</span>
                               )}
                           </div>
                        )
                      ) : (
                        <audio
                          controls
                          src={msg.voice}
                          className="w-[250px] mb-2"
                        />
                      )
                    )}

                    {activeReactionMessage ===
                      msg._id && (

                        <div
                          onClick={(e) => {

                            e.stopPropagation();

                          }}
                          className={`
absolute
${index === 0 ? "-bottom-14" : "-top-14"}
bg-white
shadow-lg
rounded-full
px-3
py-2
flex
gap-3
z-50
${msg.sender?.toString() ===
                              userData?._id?.toString()
                              ? "right-4"
                              : "left-4"
                            }
`}

                        >

                          {["❤️", "😂", "🔥", "👍"].map(

                            (emoji) => (

                              <button

                                key={emoji}

                                onClick={() => {

                                  reactToMessage(

                                    msg._id,

                                    emoji

                                  );

                                  setActiveReactionMessage(
                                    null
                                  );

                                }}

                                className="
          text-xl
          hover:scale-125
          transition
          "

                              >

                                {emoji}

                              </button>

                            )



                          )}

                          {msg.sender?.toString() ===
                            userData?._id?.toString() && (

                              <>
                                <button
                                  onClick={() => {
                                    const timeDiff = Date.now() - new Date(msg.createdAt).getTime();
                                    if (timeDiff > 15 * 60 * 1000) {
                                      alert("You can only edit messages within 15 minutes of sending.");
                                    } else {
                                      setEditingMessageId(msg._id);
                                      setMessage(msg.message);
                                      setActiveReactionMessage(null);
                                    }
                                  }}
                                  className="text-blue-500 font-bold px-2"
                                >
                                  <Edit3 size={20} />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    deleteMessageForEveryone(msg._id);
                                    setActiveReactionMessage(null);
                                  }}
                                  className="text-red-500 font-bold px-2"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </>

                            )}

                        </div>

                      )}





                    {/* MESSAGE AND TIME */}
                    <div className="flex flex-wrap items-end gap-x-3 mt-1">

                      <div className="flex-1 min-w-0">
                        {msg.isDeleted ? (
                          <p className="italic text-gray-500">
                            🚫 This message was deleted
                          </p>
                        ) : msg.message && (
                          <p className="text-gray-800 break-words whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        )}
                      </div>

                      {/* TIME AND SEEN STATUS */}
                      <div className="flex items-center gap-[2px] ml-auto text-[11px] text-gray-500">
                        {msg.isEdited && <span className="italic mr-1 text-[10px]">(Edited)</span>}
                        <span>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                        
                        {msg.sender?.toString() === userData?._id?.toString() && (
                          <span
                            className={`font-bold ml-1 text-sm ${msg.isSeen ? "text-blue-500" : "text-gray-500"}`}
                          >
                            {msg.isSeen ? "✓✓" : "✓✓"}
                          </span>
                        )}
                      </div>

                    </div>

                    {msg.reactions?.length > 0 && (

                      <div
                        className="
    flex
    gap-1
    mt-2
    flex-wrap
    "
                      >

                        {Array.isArray(msg.reactions) && msg.reactions.map(
                          (
                            reaction,
                            index
                          ) => (

                            <span
                              key={index}
                              className="
          bg-gray-100
          px-2
          py-1
          rounded-full
          text-xs
          "
                            >

                              {reaction.emoji}

                            </span>

                          )
                        )}

                      </div>

                    )}


                  </div>

                </div>

              );
            })}

            <div ref={bottomRef}></div>

          </div>

          {/* IMAGE PREVIEW */}
          {frontendImage && (
            <div className="px-4 py-2 relative w-max flex flex-col gap-2">
              <div className="relative">
                <img
                  src={frontendImage}
                  alt="preview"
                  className={`w-32 h-32 rounded-lg object-cover ${sending ? 'opacity-50' : ''}`}
                />
                {sending && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button 
                  type="button" 
                  onClick={() => setIsViewOnce(!isViewOnce)}
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition w-max ${isViewOnce ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                  <Timer size={12} /> {isViewOnce ? "View Once On" : "View Once Off"}
              </button>
            </div>
          )}

          {selectedImage && (

            <div

              className="
    fixed
    inset-0
    bg-black/90
    z-[9999]
    flex
    items-center
    justify-center
    p-4
    "

              onClick={() =>
                setSelectedImage(
                  null
                )
              }

            >

              <button

                className="
      absolute
      top-4
      right-4
      text-white
      text-4xl
      "

              >

                ×

              </button>

              <img

                src={selectedImage}

                alt="fullscreen"

                className="
      max-w-full
      max-h-full
      object-contain
      rounded-lg
      "

                onClick={(e) =>
                  e.stopPropagation()
                }

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

            {replyMessage && (

              <div
                className="
        bg-white
        border-t
        border-gray-300
        px-4
        py-2
        "
              >

                <div
                  className="
            border-l-4
            border-orange-500
            pl-3
            flex
            justify-between
            items-center
            "
                >

                  <div>

                    <p
                      className="
                    text-xs
                    text-orange-500
                    font-semibold
                    "
                    >

                      Replying to {replyMessage.sender?.toString() === userData?._id?.toString() ? "You" : (selectedUser?.name || selectedUser?.userName || "Someone")}

                    </p>

                    <p
                      className="
                    text-sm
                    truncate
                    "
                    >

                      {
                        replyMessage.message ||

                        (replyMessage.image
                          ? "📷 Image"
                          : "")
                      }

                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setReplyMessage(
                        null
                      )
                    }
                    className="
                text-red-500
                text-lg
                "
                  >

                    ✕

                  </button>

                </div>

              </div>

            )}

            {recordingMode && (

              <div
                className="
    px-4
    py-2
    text-red-500
    font-medium
    "
              >

                🎤 Recording...

              </div>

            )}



            {userData?.blockedUsers?.includes(selectedUser._id) ? (
              <div className="w-full bg-gray-50 px-2 sm:px-3 py-4 border-t border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                 You have blocked this user. Unblock them to send a message.
              </div>
            ) : editingMessageId ? (
              <form
                onSubmit={handleSendMessage}
                className="w-full bg-blue-50 px-2 sm:px-3 py-2 border-t border-blue-200 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-xs text-blue-500 font-semibold px-2">
                  <span>Editing message...</span>
                  <button type="button" onClick={() => { setEditingMessageId(null); setMessage(""); }}>✕ Cancel</button>
                </div>
                <div className="flex items-center gap-2">
                  <textarea
                    type="text"
                    value={message}
                    rows={1}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 min-w-0 resize-none px-4 py-2 rounded-2xl border border-blue-200 bg-white focus:outline-none focus:border-blue-400 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 disabled:opacity-50"
                  >
                    <SendHorizonal size={20} />
                  </button>
                </div>
              </form>
            ) : (
            <form
              onSubmit={
                handleSendMessage
              }
              className="w-full bg-white px-2 sm:px-3 py-2 border-t border-gray-300 flex items-center gap-2"
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

              {/* VIEW ONCE TOGGLE */}
              <button
                type="button"
                onClick={() => setIsViewOnce(!isViewOnce)}
                className={`flex items-center justify-center p-1 rounded-full transition-colors ${isViewOnce ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title="View Once"
              >
                <Timer size={20} />
              </button>

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
                type={
                  !message.trim() &&
                    !backendImage

                    ? "button"

                    : "submit"
                }


                onTouchStart={() => {

                  if (
                    !message.trim() &&
                    !backendImage
                  ) {

                    startRecording();

                  }

                }}

                onTouchEnd={() => {

                  if (
                    recordingMode
                  ) {

                    stopRecording();

                  }

                }}
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
    cursor-pointer
    ${sending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                  }
  `}
              >
                {!message.trim() && !backendImage ? (

                  <Mic size={20} />

                ) : (

                  <SendHorizonal size={18} />

                )}
              </button>

            </form>
            )}

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