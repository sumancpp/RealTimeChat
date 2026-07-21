import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect
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
  Timer,
  Flame,
  Palette,
  Film,
  Music,
  Play
} from "lucide-react";

import axios from "axios";

import EmojiPicker from "emoji-picker-react";

import defaultProfile from "../assets/profile.png";

import { serverUrl } from "../config";

import {
  useDispatch,
  useSelector
} from "react-redux";

import { socket, getSocket } from "../socket";

import {
  updateReaction,
  deleteMessageRedux,
  addMessage,
  removeMessageRedux,
  replaceMessageRedux
} from "../redux/messageSlice";

import {
  setSelectedUser,
  setOtherUsers,
  updateOtherUser,
  setUserData
} from "../redux/userSlice";

import GroupInfoModal from "./GroupInfoModal";

import TableTennisGame from "./TableTennisGame";
import DrawingCanvas from "./DrawingCanvas";
import ChatReplay from "./ChatReplay";

const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const now = new Date();
    const lastSeen = new Date(date);
    const diff = Math.floor((now - lastSeen) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const timeString = lastSeen.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    if (now.toDateString() === lastSeen.toDateString()) {
        return `Today at ${timeString}`;
    }
    
    const dateString = lastSeen.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${dateString} at ${timeString}`;
};

const THEMES = {
  default: {
    bg: "bg-[#efeae2]",
    myBubble: "bg-[#d9fdd3] text-gray-800",
    otherBubble: "bg-white text-gray-800",
    font: "font-sans",
    name: "Default"
  },
  cyberpunk: {
    bg: "bg-gradient-to-br from-gray-900 via-purple-900 to-black animate-gradient",
    myBubble: "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white border border-fuchsia-400/30",
    otherBubble: "bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-gray-600",
    font: "font-mono",
    name: "Cyberpunk"
  },
  sunset: {
    bg: "bg-gradient-to-br from-orange-100 via-rose-100 to-yellow-100 animate-gradient",
    myBubble: "bg-gradient-to-r from-orange-500 to-rose-500 text-white",
    otherBubble: "bg-white/80 backdrop-blur-md text-gray-800 border border-white/50",
    font: "font-sans",
    name: "Sunset Bliss"
  },
  ocean: {
    bg: "bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 animate-gradient",
    myBubble: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white",
    otherBubble: "bg-white/90 backdrop-blur-md text-blue-900 border border-white/50",
    font: "font-serif",
    name: "Ocean Breeze"
  },
  forest: {
    bg: "bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50 animate-gradient",
    myBubble: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
    otherBubble: "bg-white/90 backdrop-blur-md text-emerald-900 border border-white/50",
    font: "font-sans",
    name: "Forest Mint"
  }
};

const renderMessageWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <a 
                    key={i} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return <span key={i}>{part}</span>;
    });
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
  const [isAITypingAnimation, setIsAITypingAnimation] = useState(false);

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
  const [showChatReplay, setShowChatReplay] = useState(false);
  const [showDisappearingMenu, setShowDisappearingMenu] = useState(false);

  const [inGameMode, setInGameMode] = useState(false);
  const [isGameHost, setIsGameHost] = useState(false);
  const [activeGameMessageId, setActiveGameMessageId] = useState(null);

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

  const [chatTheme, setChatTheme] = useState('default');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setChatTheme(localStorage.getItem(`theme_${selectedUser._id}`) || 'default');
      setShowThemeMenu(false);
    }
  }, [selectedUser?._id]);

  const changeTheme = (themeKey) => {
    setChatTheme(themeKey);
    localStorage.setItem(`theme_${selectedUser._id}`, themeKey);
    setShowThemeMenu(false);
    setShowMenu(false);
  };



  const [recordingMode,
    setRecordingMode] =
    useState(false);


  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  const lastScrolledChatIdRef = useRef(null);

  // AUTO SCROLL
  useLayoutEffect(() => {
    if (!messages || messages.length === 0) return;

    if (lastScrolledChatIdRef.current !== selectedUser?._id) {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      }
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      lastScrolledChatIdRef.current = selectedUser?._id;

      requestAnimationFrame(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedUser?._id]);

  // CLEAR INPUTS ON USER SWITCH
  useEffect(() => {
    setMessage("");
    setReplyMessage(null);
    setEditingMessageId(null);
    setFrontendImage(null);
    setBackendImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setInGameMode(false);
    setActiveGameMessageId(null);
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
      const activeSocket = getSocket() || socket;
      if (!activeSocket) return;
      
      const handleGameAccepted = ({ messageId }) => {
          setInGameMode(true);
          setIsGameHost(true);
          setActiveGameMessageId(messageId);
      };
      
      const handleGameDeclined = () => {
          alert("Your game invite was declined.");
      };

      const handleGameMessageDeleted = ({ messageId }) => {
          dispatch(removeMessageRedux(messageId));
      };

      activeSocket.on("gameAccepted", handleGameAccepted);
      activeSocket.on("gameDeclined", handleGameDeclined);
      activeSocket.on("gameMessageDeleted", handleGameMessageDeleted);

      return () => {
          activeSocket.off("gameAccepted", handleGameAccepted);
          activeSocket.off("gameDeclined", handleGameDeclined);
          activeSocket.off("gameMessageDeleted", handleGameMessageDeleted);
      };
  }, [dispatch]);

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

    if (navigator.vibrate) {
        navigator.vibrate(30); // Light haptic tap for sending a message
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

      // 1. CREATE OPTIMISTIC MESSAGE FOR INSTANT UI FEEDBACK
      const tempId = "temp-" + Date.now();
      const optimisticMessage = {
          _id: tempId,
          sender: userData._id,
          message: message,
          image: frontendImage || "",
          voice: "",
          replyTo: currentReply || null,
          createdAt: new Date().toISOString(),
          isSeen: false,
          isDeleted: false,
          isSystemMessage: false,
          isAIMessage: false,
          isAIMusic: false,
          reactions: []
      };

      // Instantly dispatch to Redux to show it on screen
      dispatch(addMessage(optimisticMessage));

      // Capture inputs before clearing
      const messageTextToSend = message;

      // CLEAR AFTER OPTIMISTIC SUCCESS
      setMessage("");
      setReplyMessage(null);
      setFrontendImage(null);
      setBackendImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 2. PREPARE FORM DATA FOR SERVER
      const formData =
        new FormData();

      formData.append(
        "message",
        messageTextToSend
      );

      if (currentReply) {
        formData.append(
          "replyTo",
          currentReply._id
        );
      }

      if (backendImage) {
        formData.append(
          "file",
          backendImage
        );
      }

      if (selectedUser?.isGroup && isAnonymousMode) {
        formData.append("isAnonymous", "true");
      }

      const isAiTriggered = messageTextToSend?.trim().toLowerCase().startsWith("@ai") ||
                            messageTextToSend?.trim().toLowerCase() === "@roast" ||
                            messageTextToSend?.trim().toLowerCase() === "@music" ||
                            selectedUser?.isAI;
      
      if (isAiTriggered) {
          setIsAITypingAnimation(true);
          // Scroll slightly down to make sure animation is visible
          setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
      }

      // 3. SEND TO SERVER
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
          dispatch(replaceMessageRedux({ tempId, realMessage: res.data.message }));
          dispatch(addMessage(res.data.aiMessage));
        } else if (res.data._id) {
          dispatch(replaceMessageRedux({ tempId, realMessage: res.data }));
        }
      }

    }

    catch (error) {

      console.log(error);

    }

    finally {

      setSending(false);
      setIsAITypingAnimation(false);

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

    <div className={`w-full h-full h-[100dvh] flex flex-col overflow-hidden ${THEMES[chatTheme].bg} ${THEMES[chatTheme].font} transition-all duration-500`}>

      {selectedUser ? (

        <>

          {/* HEADER */}
          <div className="w-full h-[70px] min-h-[70px] shrink-0 bg-white border-b border-gray-300 flex items-center px-4 shadow-sm z-50">

            <button
              onClick={() => {
                if (window.history.state?.chatOpen) {
                  window.history.back();
                } else {
                  dispatch(setSelectedUser(null));
                }
              }}
              className="lg:hidden mr-3 shrink-0"
            >

              <ArrowLeft
                size={24}
                className="text-gray-700"
              />

            </button>

            <div 
              className={`flex items-center flex-1 min-w-0 ${selectedUser?.isGroup ? 'cursor-pointer hover:bg-gray-50 py-1 px-2 -ml-2 rounded-xl transition-colors' : ''}`}
              onClick={() => {
                  if (selectedUser?.isGroup) {
                      setShowGroupInfo(true);
                  }
              }}
            >
              <img
                src={
                  (selectedUser?.isGroup ? selectedUser?.groupProfileImage : selectedUser?.profileImage) ||
                  defaultProfile
                }
                alt="profile"
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />

              <div className="ml-3 truncate">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#0b2a5b] truncate">
                      {
                        selectedUser?.isGroup 
                          ? selectedUser.groupName 
                          : (selectedUser?.name || selectedUser?.userName)
                      }
                    </h2>
                    {selectedUser?.disappearingTimer > 0 && (
                        <Timer size={14} className="text-blue-500 shrink-0" />
                    )}
                </div>

                <p className="text-xs text-gray-500 truncate">
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
            </div>

            <div className="ml-auto flex items-center gap-4 text-gray-500 relative shrink-0">
              {selectedUser?.isGroup ? (
                <button 
                  onClick={() => setShowDrawingCanvas(true)}
                  className="hover:text-purple-500 hover:bg-purple-50 p-2 rounded-full transition-colors"
                  title="Group Whiteboard"
                >
                  <Palette size={24} />
                </button>
              ) : (
                <>
                  {!selectedUser?.isAI && (
                    <>
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
                    </>
                  )}
                  <button 
                    onClick={() => setShowMenu(!showMenu)} 
                    className="hover:text-gray-700 hover:bg-gray-50 p-2 rounded-full transition-colors"
                  >
                    <MoreVertical size={24} />
                  </button>

                  {showMenu && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 shadow-lg rounded-lg w-56 z-50 flex flex-col overflow-hidden">
                      <button onClick={() => { setShowChatReplay(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-200 flex items-center gap-2 font-medium border-b border-gray-100">
                          <Film size={16} /> Play Chat Story
                      </button>
                      <button onClick={handleBlockToggle} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                          <Ban size={16} className={userData?.blockedUsers?.includes(selectedUser._id) ? "text-green-500" : "text-red-500"} />
                          {userData?.blockedUsers?.includes(selectedUser._id) ? "Unblock" : "Block"}
                      </button>

                      <button onClick={() => setShowThemeMenu(!showThemeMenu)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100">
                          <Edit3 size={16} className="text-indigo-500" /> Theme: {THEMES[chatTheme].name}
                      </button>
                      {showThemeMenu && (
                          <div className="bg-gray-50 border-t border-gray-200">
                              {Object.keys(THEMES).map(key => (
                                  <button 
                                      key={key} 
                                      onClick={() => changeTheme(key)}
                                      className={`w-full text-left px-8 py-2 text-sm hover:bg-gray-200 ${chatTheme === key ? 'font-bold text-indigo-600' : 'text-gray-600'}`}
                                  >
                                      {THEMES[key].name}
                                  </button>
                              ))}
                          </div>
                      )}

                      <button onClick={() => handleDeleteChat(false)} className="w-full text-left px-4 py-3 text-sm text-red-800 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100">
                          <Trash2 size={16} /> Delete for me
                      </button>
                      <button onClick={() => handleDeleteChat(true)} className="w-full text-left px-4 py-3 text-sm text-red-800 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100">
                          <Trash2 size={16} /> Delete for everyone
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          <GroupInfoModal 
             isOpen={showGroupInfo}
             onClose={() => setShowGroupInfo(false)}
             group={selectedUser}
          />

          {showDrawingCanvas && selectedUser?.isGroup && (
              <DrawingCanvas groupId={selectedUser._id} onClose={() => setShowDrawingCanvas(false)} />
          )}

          {showChatReplay && (
              <ChatReplay 
                  messages={messages} 
                  currentUser={userData} 
                  selectedUser={selectedUser} 
                  onClose={() => setShowChatReplay(false)} 
              />
          )}

          {inGameMode ? (
              <TableTennisGame 
                  opponent={selectedUser} 
                  isHost={isGameHost} 
                  activeGameMessageId={activeGameMessageId}
                  onEndGame={() => setInGameMode(false)} 
              />
          ) : (
          <>
          {/* MESSAGES */}
          <div
            ref={messageContainerRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 py-5"
            onClick={() =>
              setActiveReactionMessage(
                null
              )
            }
          >

            {Array.isArray(messages) && messages.map(
              (msg, index) => {
                  if (msg.message === "@game") {
                      return (
                          <div key={msg._id || index} className="flex justify-center my-4 w-full">
                              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center max-w-[85%] shadow-sm">
                                  <div className="text-3xl mb-2">🏓</div>
                                  <p className="font-bold text-[#0b2a5b] mb-3">
                                      {msg.sender?._id?.toString() === userData?._id?.toString() || msg.sender?.toString() === userData?._id?.toString()
                                          ? "You sent a Table Tennis invite" 
                                          : `${msg.sender?.name || msg.sender?.userName || "Someone"} invited you to play Table Tennis!`}
                                  </p>
                                  {(msg.sender?._id?.toString() !== userData?._id?.toString() && msg.sender?.toString() !== userData?._id?.toString()) && (
                                      <div className="flex gap-3 justify-center">
                                          <button 
                                              onClick={() => {
                                                  const activeSocket = getSocket() || socket;
                                                  activeSocket.emit("acceptGame", { to: selectedUser._id, messageId: msg._id });
                                                  setInGameMode(true);
                                                  setIsGameHost(false);
                                                  setActiveGameMessageId(msg._id);
                                              }} 
                                              className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-green-600 transition-colors shadow-sm"
                                          >
                                              Accept
                                          </button>
                                          <button 
                                              onClick={() => {
                                                  const activeSocket = getSocket() || socket;
                                                  activeSocket.emit("declineGame", { to: selectedUser._id, messageId: msg._id });
                                              }} 
                                              className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
                                          >
                                              Decline
                                          </button>
                                      </div>
                                  )}
                                  {(msg.sender?._id?.toString() === userData?._id?.toString() || msg.sender?.toString() === userData?._id?.toString()) && (
                                      <p className="text-xs text-gray-500 italic">Waiting for response...</p>
                                  )}
                              </div>
                          </div>
                      );
                  }

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



                    className={`relative p-2 rounded-2xl max-w-[80%] sm:max-w-[70%] shadow-sm ${
                        msg.isAIMessage 
                          ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md border border-white/20'
                          : (msg.sender?._id || msg.sender)?.toString() === userData?._id?.toString()
                            ? THEMES[chatTheme].myBubble
                            : THEMES[chatTheme].otherBubble
                      }`}

                  >
                  
                  {selectedUser?.isGroup && (msg.sender?._id || msg.sender)?.toString() !== userData?._id?.toString() && (
                      <p className="text-xs font-bold text-orange-500 mb-1">
                          {msg.isAnonymous ? "Secret Member" : (msg.sender?.name || msg.sender?.userName || "Someone")}
                      </p>
                  )}

                    {msg.replyTo && (

                      <div
                        className="
        border-l-4
        border-orange-500
        bg-black/10
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
                            msg.replyTo.message ? renderMessageWithLinks(msg.replyTo.message) :

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
                        <img
                          src={msg.image}
                          alt="chat"
                          onClick={() => setSelectedImage(msg.image)}
                          className="max-w-[200px] sm:max-w-[250px] max-h-[250px] rounded-xl object-cover mb-2 cursor-pointer hover:opacity-90 transition"
                        />
                    )}

                    {msg.voice && (
                        <audio
                          controls
                          src={msg.voice}
                          className="w-[250px] mb-2"
                        />
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
                          <p className="italic opacity-70">
                            🚫 This message was deleted
                          </p>
                        ) : msg.message && (
                          <div className="break-words whitespace-pre-wrap">
                            {msg.isAIMessage && <span className="mr-1">✨</span>}
                            {renderMessageWithLinks(msg.message)}
                          </div>
                        )}
                        
                        {msg.isAIMusic && msg.musicQuery && (
                          <a 
                            href={`https://music.youtube.com/search?q=${encodeURIComponent(msg.musicQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 bg-white/20 hover:bg-white/30 transition border border-white/30 p-3 rounded-xl flex items-center gap-3 backdrop-blur-sm cursor-pointer shadow-sm group decoration-transparent no-underline block"
                          >
                            <div className="bg-white text-pink-500 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                <Play size={20} fill="currentColor" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate text-white leading-tight">{msg.musicQuery}</p>
                                <p className="text-[10px] opacity-90 flex items-center gap-1 mt-1 font-medium">
                                    <Music size={10} /> Listen on YouTube Music
                                </p>
                            </div>
                          </a>
                        )}
                      </div>

                      {/* TIME AND SEEN STATUS */}
                      <div className="flex items-center gap-[2px] ml-auto text-[11px] opacity-70">
                        {msg.isEdited && <span className="italic mr-1 text-[10px]">(Edited)</span>}
                        <span>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                        
                        {msg.sender?.toString() === userData?._id?.toString() && (
                          <span
                            className={`font-bold ml-1 text-sm ${msg.isSeen ? "text-blue-500" : "opacity-70"}`}
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

            {isAITypingAnimation && (
              <div className="flex mb-4 justify-start">
                <div className="relative py-2 px-4 max-w-[80%] sm:max-w-[70%] bg-transparent">
                  <div className="flex items-center text-gray-500 text-sm font-medium animate-pulse">
                    <span className="mr-2 text-lg">✨</span> Thinking...
                  </div>
                </div>
              </div>
            )}

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
          <div className="relative shrink-0">

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
                        replyMessage.message ? renderMessageWithLinks(replyMessage.message) :

                        (replyMessage.image
                          ? "📷 Image"
                          : replyMessage.voice
                            ? "🎤 Voice Message"
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

              {selectedUser?.isGroup && (
                  <button
                    type="button"
                    onClick={() => setIsAnonymousMode(!isAnonymousMode)}
                    className={`transition mx-1 p-1.5 rounded-full ${isAnonymousMode ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                    title="Incognito Mode"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11v1a10 10 0 1 1-9-10 1.2 1.2 0 0 1 1.14 1.76l-1 2.24a1 1 0 0 0 .91 1.41h2.21a2 2 0 0 1 2 2z"/></svg>
                  </button>
              )}

              {!selectedUser?.isGroup && (
                <>
                  {/* MUSIC MOOD */}
                  <button
                    type="button"
                    onClick={() => setMessage("@music")}
                    className="text-pink-500 hover:text-pink-600 transition mx-1"
                    title="Mood Music Suggestions"
                  >
                    <Music size={24} />
                  </button>

                  {/* ROAST */}
                  <button
                    type="button"
                    onClick={() => setMessage("@roast")}
                    className="text-orange-500 hover:text-orange-600 transition mx-1"
                    title="AI Roast Mode"
                  >
                    <Flame size={24} />
                  </button>
                </>
              )}

              {/* SEND */}
              <button
                type={(!message.trim() && !backendImage) ? "button" : "submit"}
                onClick={(e) => {
                  if (!message.trim() && !backendImage) {
                    e.preventDefault();
                    if (recordingMode) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
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
                {(!message.trim() && !backendImage && !recordingMode) ? (
                  <Mic size={20} />
                ) : (
                  <SendHorizonal size={18} />
                )}
              </button>

            </form>
            )}

          </div>
          </>
          )}

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