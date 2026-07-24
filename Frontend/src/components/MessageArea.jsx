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
  Play,
  Ghost,
  Swords,
  X,
  Sparkles,
  Languages,
  Bot
} from "lucide-react";


import axios from "axios";

import EmojiPicker from "emoji-picker-react";

import defaultProfile from "../assets/profile.png";

const IncognitoIcon = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2 11c.5 0 2.5-.5 5-1 2.5 1 5 1.5 5 1.5s2.5-.5 5-1.5c2.5.5 4.5 1 5 1 1 0 1-1 0-1-1.5-.5-3.5-1.5-5.5-2.5C15 6 14.5 4 12 4S9 6 7.5 9C5.5 10 3.5 11 2 11.5c-1 0-1 1 0 1z" />
    <circle cx="7.5" cy="16.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="16.5" cy="16.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M10 16.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);


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
  revealGhostMessageRedux,
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
import VoiceStudioModal from "./VoiceStudioModal";
import GhostMessageBubble from "./GhostMessageBubble";
import MiniGameHub from "./MiniGameHub";

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

  const { onlineUsers, otherUsers } =
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

  // REAL AI INTEGRATION STATES
  const [showAIHubModal, setShowAIHubModal] = useState(false);
  const [aiSummaryModal, setAiSummaryModal] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState("");
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  const [smartReplies, setSmartReplies] = useState([]);
  const [loadingSmartReplies, setLoadingSmartReplies] = useState(false);

  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [targetLang, setTargetLang] = useState("Spanish");
  const [translatedResult, setTranslatedResult] = useState("");
  const [loadingTranslate, setLoadingTranslate] = useState(false);

  const handleFetchAISummary = async () => {
      if (!selectedUser?._id) return;
      setLoadingAiSummary(true);
      setAiSummaryModal(true);
      setAiSummaryText("");
      try {
          const res = await axios.get(`${serverUrl}/message/ai-summary/${selectedUser._id}`, { withCredentials: true });
          setAiSummaryText(res.data.summary || "No summary available.");
      } catch (err) {
          console.error("AI Summary error", err);
          setAiSummaryText("Failed to generate AI summary.");
      } finally {
          setLoadingAiSummary(false);
      }
  };

  const handleFetchSmartReplies = async () => {
      if (!selectedUser?._id) return;
      setLoadingSmartReplies(true);
      try {
          const res = await axios.get(`${serverUrl}/message/ai-smart-replies/${selectedUser._id}`, { withCredentials: true });
          setSmartReplies(res.data.suggestions || []);
      } catch (err) {
          console.error("Smart replies error", err);
      } finally {
          setLoadingSmartReplies(false);
      }
  };

  const handleTranslateText = async (textToTranslate) => {
      const text = textToTranslate || message || (messages && messages.length > 0 ? messages[messages.length - 1].message : "Hello");
      if (!text) return;
      setLoadingTranslate(true);
      setTranslatedResult("");
      try {
          const res = await axios.post(`${serverUrl}/message/translate-message`, { text, targetLanguage: targetLang }, { withCredentials: true });
          setTranslatedResult(res.data.translatedText || "Translation failed.");
      } catch (err) {
          console.error("Translation error", err);
          setTranslatedResult("Translation failed.");
      } finally {
          setLoadingTranslate(false);
      }
  };

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
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [showMiniGameHub, setShowMiniGameHub] = useState(false);
  const [isMiniGameHost, setIsMiniGameHost] = useState(true);
  const [miniGameType, setMiniGameType] = useState('tabletennis');
  const [incomingGameInvite, setIncomingGameInvite] = useState(null);
  const [gameInviteSent, setGameInviteSent] = useState(false);
  const [showGamePicker, setShowGamePicker] = useState(false);




  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  const lastScrolledChatIdRef = useRef(null);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleStartMiniGame = ({ from, gameType }) => {
      const senderId = (from?._id || from)?.toString();
      const targetId = (selectedUser?._id || selectedUser)?.toString();
      if (senderId === targetId) {
        setIsMiniGameHost(false);
        if (gameType) setMiniGameType(gameType);
        setShowMiniGameHub(true);
      }
    };

    const handleTTTMove = ({ from }) => {
      const senderId = (from?._id || from)?.toString();
      const targetId = (selectedUser?._id || selectedUser)?.toString();
      if (senderId === targetId) {
        setShowMiniGameHub(prev => {
          if (!prev) {
            setIsMiniGameHost(false);
            return true;
          }
          return prev;
        });
      }
    };

    const handleRPSChoice = ({ from }) => {
      const senderId = (from?._id || from)?.toString();
      const targetId = (selectedUser?._id || selectedUser)?.toString();
      if (senderId === targetId) {
        setShowMiniGameHub(prev => {
          if (!prev) {
            setIsMiniGameHost(false);
            return true;
          }
          return prev;
        });
      }
    };

    socket.on("startMiniGame", handleStartMiniGame);
    socket.on("ticTacToeMove", handleTTTMove);
    socket.on("rpsChoice", handleRPSChoice);

    return () => {
      socket.off("startMiniGame", handleStartMiniGame);
      socket.off("ticTacToeMove", handleTTTMove);
      socket.off("rpsChoice", handleRPSChoice);
    };
  }, [socket, selectedUser]);

  // AUTO SCROLL (Smart: Only scroll if near bottom or user switched chat / sent message)
  useLayoutEffect(() => {
    if (!messages || messages.length === 0) return;

    const container = messageContainerRef.current;
    const isUserSwitch = lastScrolledChatIdRef.current !== selectedUser?._id;

    if (isUserSwitch) {
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      lastScrolledChatIdRef.current = selectedUser?._id;

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    } else {
      // Check if user is near bottom (within 150px)
      const isNearBottom = container
        ? container.scrollHeight - container.scrollTop - container.clientHeight < 150
        : true;

      const lastMsg = messages[messages.length - 1];
      const isMyLastMsg = (lastMsg?.sender?._id || lastMsg?.sender)?.toString() === userData?._id?.toString();

      if (isNearBottom || isMyLastMsg) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, selectedUser?._id, userData?._id]);


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

      const handleGameInvite = ({ from, gameType }) => {
          const senderUser = (otherUsers && Array.isArray(otherUsers)) 
              ? otherUsers.find(u => (u._id?.toString() || u?.toString()) === (from?._id?.toString() || from?.toString()))
              : null;
          const fromUserObj = senderUser || (selectedUser && (selectedUser._id?.toString() === from?.toString()) ? selectedUser : { _id: from, name: "Opponent" });
          setIncomingGameInvite({ fromUser: fromUserObj, gameType: gameType || 'tabletennis' });
      };
      
      const handleGameAccepted = ({ gameType, messageId }) => {
          setGameInviteSent(false);
          setIsMiniGameHost(true);
          setMiniGameType(gameType || 'tabletennis');
          setShowMiniGameHub(true);
          if (messageId) {
              setInGameMode(true);
              setIsGameHost(true);
              setActiveGameMessageId(messageId);
          }
      };
      
      const handleGameDeclined = () => {
          setGameInviteSent(false);
          alert("Your game duel invitation was declined.");
      };

      const handleGameMessageDeleted = ({ messageId }) => {
          dispatch(removeMessageRedux(messageId));
      };

      activeSocket.on("gameInvite", handleGameInvite);
      activeSocket.on("gameAccepted", handleGameAccepted);
      activeSocket.on("gameDeclined", handleGameDeclined);
      activeSocket.on("gameMessageDeleted", handleGameMessageDeleted);

      return () => {
          activeSocket.off("gameInvite", handleGameInvite);
          activeSocket.off("gameAccepted", handleGameAccepted);
          activeSocket.off("gameDeclined", handleGameDeclined);
          activeSocket.off("gameMessageDeleted", handleGameMessageDeleted);
      };
  }, [dispatch, otherUsers, selectedUser]);


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
            if (audioBlob.size > 0) {
              setRecordedAudioBlob(audioBlob);
            }
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
      mediaRecorderRef.current
    ) {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
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
          isGhost: isGhostMode || message?.startsWith('@ghost'),
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

      if (isGhostMode) {
        formData.append("isGhost", "true");
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

    socket.on(
      "ghostMessageDisintegrated",
      ({ messageId }) => {
        dispatch(removeMessageRedux(messageId));
      }
    );

    socket.on(
      "ghostMessageRevealed",
      ({ messageId, ghostRevealedAt }) => {
        dispatch(revealGhostMessageRedux({ messageId, ghostRevealedAt }));
      }
    );

    return () => {

      socket.off(
        "messageReaction"
      );

      socket.off(
        "messageDeleted"
      );

      socket.off(
        "ghostMessageDisintegrated"
      );

      socket.off(
        "ghostMessageRevealed"
      );

    };

  }, [dispatch]);

  const handleRevealGhostMessage = (messageId) => {
    const activeSocket = getSocket() || socket;
    if (activeSocket) {
      activeSocket.emit("revealGhostMessage", { messageId });
    }
    axios.post(`${serverUrl}/message/reveal-ghost/${messageId}`, {}, { withCredentials: true }).catch(() => {});
  };

  const handleDisintegrateGhostMessage = (messageId) => {
    dispatch(removeMessageRedux(messageId));
    const activeSocket = getSocket() || socket;
    if (activeSocket) {
      activeSocket.emit("disintegrateGhostMessage", { messageId });
    }
    axios.delete(`${serverUrl}/message/ghost/${messageId}`, { withCredentials: true }).catch(() => {});
  };


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

            <div className="ml-auto flex items-center gap-1 sm:gap-4 text-gray-500 relative shrink-0">
              {selectedUser?.isGroup ? (
                <button 
                  onClick={() => setShowDrawingCanvas(true)}
                  className="hover:text-purple-500 hover:bg-purple-50 p-1.5 sm:p-2 rounded-full transition-colors"
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
                        className="hover:text-green-500 hover:bg-green-50 p-1.5 sm:p-2 rounded-full transition-colors"
                      >
                        <Video size={24} />
                      </button>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('startCall', { detail: { userToCall: selectedUser, type: 'voice' } }))}
                        className="hover:text-green-500 hover:bg-green-50 p-1.5 sm:p-2 rounded-full transition-colors"
                      >
                        <Phone size={22} />
                      </button>
                    </>
                  )}
                  <div ref={menuRef} className="relative">
                    <button 
                      onClick={() => setShowMenu(!showMenu)} 
                      className="hover:text-gray-700 hover:bg-gray-50 p-1.5 sm:p-2 rounded-full transition-colors"
                    >
                      <MoreVertical size={24} />
                    </button>

                    {showMenu && (
                      <div className="absolute top-12 right-0 bg-white border border-gray-200 shadow-lg rounded-lg w-56 z-50 flex flex-col overflow-hidden">
                        <button onClick={() => { setShowMenu(false); setShowAIHubModal(true); }} className="w-full text-left px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2 font-bold border-b border-gray-100 bg-purple-50/50">
                            <Sparkles size={16} className="text-purple-600 animate-pulse" /> 🤖 AI Features Hub
                        </button>
                        <button onClick={() => { setShowChatReplay(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-200 flex items-center gap-2 font-medium border-b border-gray-100">
                            <Film size={16} /> Play Chat Story
                        </button>
                        <button onClick={() => { 
                            setShowMenu(false); 
                            if (selectedUser?._id) {
                                setShowGamePicker(true);
                            }
                        }} className="w-full text-left px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 font-medium border-b border-gray-100">
                            <Swords size={16} /> Play Mini-Game Duel
                        </button>


                      <button onClick={() => { setIsGhostMode(!isGhostMode); setShowMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 font-medium border-b border-gray-100 ${isGhostMode ? 'bg-purple-100 text-purple-700 font-bold' : 'text-purple-600 hover:bg-purple-50'}`}>
                          <Ghost size={16} /> {isGhostMode ? "Ghost Ink Mode (ON)" : "Ghost Ink Mode"}
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
                  </div>
                </>
              )}

            </div>

          </div>

          <GroupInfoModal 
             isOpen={showGroupInfo}
             onClose={() => setShowGroupInfo(false)}
             group={selectedUser}
          />

          {/* AI FEATURES HUB MODAL */}
          {showAIHubModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl animate-in zoom-in-95 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-500/30">
                      <Sparkles size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white">🤖 AI Features Hub</h3>
                      <p className="text-xs text-purple-300">Powered by Google Gemini API</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAIHubModal(false)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {/* 1. AI Summary */}
                  <button
                    onClick={() => {
                      setShowAIHubModal(false);
                      handleFetchAISummary();
                    }}
                    className="flex items-center gap-3 p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Sparkles size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-purple-300">✨ AI Conversation Summary</h4>
                      <p className="text-xs text-slate-400">Summarize recent chat in 3 bullet points</p>
                    </div>
                  </button>

                  {/* 2. Smart Replies */}
                  <button
                    onClick={() => {
                      setShowAIHubModal(false);
                      handleFetchSmartReplies();
                    }}
                    className="flex items-center gap-3 p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Bot size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-300">💡 AI Smart Replies</h4>
                      <p className="text-xs text-slate-400">Generate 3 contextual quick-reply options</p>
                    </div>
                  </button>

                  {/* 3. Live Translator */}
                  <button
                    onClick={() => {
                      setShowAIHubModal(false);
                      setShowTranslateModal(true);
                    }}
                    className="flex items-center gap-3 p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Languages size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">🌐 AI Live Translator</h4>
                      <p className="text-xs text-slate-400">Translate messages into 10+ languages</p>
                    </div>
                  </button>

                  {/* 4. AI Roast Mode */}
                  <button
                    onClick={() => {
                      setShowAIHubModal(false);
                      setMessage("@roast");
                    }}
                    className="flex items-center gap-3 p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Flame size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-orange-300">🔥 AI Roast Mode</h4>
                      <p className="text-xs text-slate-400">Generate a friendly roast burn for your friend</p>
                    </div>
                  </button>

                  {/* 5. AI Mood Music */}
                  <button
                    onClick={() => {
                      setShowAIHubModal(false);
                      setMessage("@music");
                    }}
                    className="flex items-center gap-3 p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Music size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-pink-300">🎵 AI Mood Music</h4>
                      <p className="text-xs text-slate-400">Get song suggestions based on chat vibe</p>
                    </div>
                  </button>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setShowAIHubModal(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI SUMMARY MODAL */}
          {aiSummaryModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl animate-in zoom-in-95 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
                      <Sparkles size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white">✨ AI Conversation Summary</h3>
                      <p className="text-xs text-purple-300">Powered by Google Gemini 2.5</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAiSummaryModal(false)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 min-h-[160px] max-h-[300px] overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-sm leading-relaxed text-slate-200">
                  {loadingAiSummary ? (
                    <div className="flex flex-col items-center justify-center h-40 text-purple-400 gap-3">
                      <Sparkles size={32} className="animate-spin text-purple-500" />
                      <p className="text-xs font-semibold animate-pulse">Analyzing conversation context & generating summary...</p>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">{aiSummaryText}</div>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setAiSummaryModal(false)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI TRANSLATION MODAL */}
          {showTranslateModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl animate-in zoom-in-95 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                      <Languages size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white">🌐 AI Real-Time Translator</h3>
                      <p className="text-xs text-cyan-300">Translate messages instantly into any language</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowTranslateModal(false)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-400">Target Language:</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {["Spanish", "Hindi", "French", "German", "Japanese", "Mandarin", "Arabic", "Russian", "Italian", "Portuguese"].map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleTranslateText()}
                      disabled={loadingTranslate}
                      className="ml-auto px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {loadingTranslate ? "Translating..." : "Translate Now"}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-sm min-h-[100px] text-slate-200 font-sans">
                    {loadingTranslate ? (
                      <div className="flex items-center justify-center h-20 text-cyan-400 gap-2">
                        <Languages size={20} className="animate-spin text-cyan-500" />
                        <span className="text-xs">Translating with Gemini AI...</span>
                      </div>
                    ) : translatedResult ? (
                      <div>
                        <span className="text-xs font-bold text-cyan-400 block mb-1">Result ({targetLang}):</span>
                        <p className="text-sm font-medium">{translatedResult}</p>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic">Select a language and click "Translate Now" to translate the message.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex gap-3 justify-end">
                  {translatedResult && (
                    <button
                      onClick={() => {
                        setMessage(translatedResult);
                        setShowTranslateModal(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
                    >
                      Insert in Chat
                    </button>
                  )}
                  <button
                    onClick={() => setShowTranslateModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {recordedAudioBlob && (
              <VoiceStudioModal 
                  audioBlob={recordedAudioBlob}
                  onSend={async (finalBlob) => {
                      setRecordedAudioBlob(null);
                      await sendVoiceMessage(finalBlob);
                  }}
                  onClose={() => setRecordedAudioBlob(null)}
              />
          )}

          {/* GAME SELECTION MODAL */}
          {showGamePicker && selectedUser && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-white">
                      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                                  <Swords size={22} className="animate-bounce" />
                              </div>
                              <div>
                                  <h2 className="font-bold text-base text-white">Choose Mini-Game Duel</h2>
                                  <p className="text-xs text-amber-200/80">Challenge {selectedUser?.name || selectedUser?.userName}</p>
                              </div>
                          </div>
                          <button onClick={() => setShowGamePicker(false)} className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                              <X size={18} />
                          </button>
                      </div>

                      <div className="p-5 grid grid-cols-1 gap-3.5 bg-slate-950">
                          {[
                              { id: 'tabletennis', icon: '🏓', title: 'Table Tennis', desc: 'Real-time 2D paddle duel' },
                              { id: 'tictactoe', icon: '❌⭕', title: 'Tic-Tac-Toe', desc: '3x3 grid turn-based strategy' },
                              { id: 'rps', icon: '✊✋✌️', title: 'Rock Paper Scissors', desc: 'Quick choice weapon duel' }
                          ].map(game => (
                              <button
                                  key={game.id}
                                  onClick={() => {
                                      setShowGamePicker(false);
                                      setGameInviteSent(true);
                                      const activeSocket = getSocket() || socket;
                                      if (activeSocket) {
                                          activeSocket.emit("gameInvite", { to: selectedUser._id, gameType: game.id });
                                      }
                                  }}
                                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition-all text-left group active:scale-98 cursor-pointer"
                              >
                                  <div className="text-3xl p-3 bg-slate-950 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform">
                                      {game.icon}
                                  </div>
                                  <div className="flex-1">
                                      <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">{game.title}</h3>
                                      <p className="text-xs text-slate-400 mt-0.5">{game.desc}</p>
                                  </div>
                                  <div className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs">
                                      Send Invite →
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {showMiniGameHub && selectedUser && (
              <MiniGameHub 
                  opponent={selectedUser}
                  gameType={miniGameType}
                  isHost={isMiniGameHost}
                  onClose={() => setShowMiniGameHub(false)}
              />
          )}

          {/* GAME DUEL INVITATION PERMISSION MODAL */}
          {incomingGameInvite && (

              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-sm w-full text-center text-white shadow-2xl animate-in zoom-in-95">
                      <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30 animate-bounce">
                          <Swords size={32} />
                      </div>
                      <h3 className="font-extrabold text-xl text-white">Mini-Game Duel Invite!</h3>
                      <p className="text-sm text-slate-300 my-3">
                          <span className="font-bold text-amber-400">{incomingGameInvite.fromUser?.name || incomingGameInvite.fromUser?.userName || "Opponent"}</span> wants to duel with you in <span className="font-semibold text-amber-300">{incomingGameInvite.gameType === 'tictactoe' ? 'Tic-Tac-Toe' : incomingGameInvite.gameType === 'rps' ? 'Rock-Paper-Scissors' : 'Table Tennis'}</span>!
                      </p>
                      <div className="flex gap-3 mt-6">
                          <button
                              onClick={() => {
                                  const fromId = incomingGameInvite.fromUser?._id || incomingGameInvite.fromUser;
                                  const gType = incomingGameInvite.gameType || 'tabletennis';
                                  const activeSocket = getSocket() || socket;
                                  if (activeSocket) {
                                      activeSocket.emit("acceptGame", { to: fromId, gameType: gType });
                                  }
                                  setIsMiniGameHost(false);
                                  setMiniGameType(gType);
                                  setShowMiniGameHub(true);
                                  setIncomingGameInvite(null);
                              }}
                              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                          >
                              Accept & Play 🎮
                          </button>
                          <button
                              onClick={() => {
                                  const fromId = incomingGameInvite.fromUser?._id || incomingGameInvite.fromUser;
                                  const activeSocket = getSocket() || socket;
                                  if (activeSocket) {
                                      activeSocket.emit("declineGame", { to: fromId });
                                  }
                                  setIncomingGameInvite(null);
                              }}
                              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-2xl transition-all active:scale-95 cursor-pointer"
                          >
                              Decline
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* SENDER WAITING FOR ACCEPTANCE BANNER */}
          {gameInviteSent && (
              <div className="fixed top-20 right-4 z-50 bg-slate-900/90 border border-amber-500/60 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl animate-spin">
                      <Swords size={20} />
                  </div>
                  <div className="text-xs">
                      <p className="font-bold text-amber-300">Game Duel Invitation Sent!</p>
                      <p className="text-slate-400">Waiting for {selectedUser?.name || selectedUser?.userName} to accept...</p>
                  </div>
                  <button
                      onClick={() => setGameInviteSent(false)}
                      className="ml-2 text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer"
                  >
                      Cancel
                  </button>
              </div>
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

                  if (msg.isGhost || (typeof msg.message === 'string' && msg.message.startsWith('@ghost'))) {
                      const isOwn = (msg.sender?._id || msg.sender)?.toString() === userData?._id?.toString();
                      return (
                          <div key={msg._id || index} className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
                              <GhostMessageBubble 
                                  msg={msg} 
                                  isOwn={isOwn} 
                                  renderMessageWithLinks={renderMessageWithLinks} 
                                  onReveal={handleRevealGhostMessage}
                                  onDisintegrate={handleDisintegrateGhostMessage}
                              />
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
            <>
              {smartReplies && smartReplies.length > 0 && (
                <div className="w-full bg-purple-50/90 border-t border-purple-200 px-3 py-2 flex items-center gap-2 flex-wrap text-xs shadow-inner animate-in slide-in-from-bottom-2">
                  <span className="font-bold text-purple-700 flex items-center gap-1">
                    <Sparkles size={14} className="text-purple-600 animate-pulse" /> AI Smart Replies:
                  </span>
                  {smartReplies.map((reply, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setMessage(reply);
                        setSmartReplies([]);
                      }}
                      className="bg-white hover:bg-purple-600 hover:text-white text-purple-800 border border-purple-300 px-3 py-1 rounded-full font-medium shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      {reply}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSmartReplies([])}
                    className="ml-auto text-gray-400 hover:text-gray-600 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={isGhostMode ? "Ghost Ink Mode 👻 (Disintegrates 5s after reading)" : "Type a message..."}
                className={`
flex-1
min-w-0
resize-none
max-h-32
px-4
py-3
rounded-3xl
${isGhostMode ? 'bg-purple-50 border-2 border-purple-500/80 text-purple-950 font-medium' : 'bg-slate-100'}
outline-none
overflow-y-auto
text-sm
transition-all
`}
              />

              {selectedUser?.isGroup && (
                  <button
                    type="button"
                    onClick={() => setIsAnonymousMode(!isAnonymousMode)}
                    className={`transition mx-1 p-2 rounded-full flex items-center justify-center ${isAnonymousMode ? 'bg-slate-900 text-amber-400 shadow-md ring-2 ring-amber-500/50 scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                    title={isAnonymousMode ? "Incognito Mode (ON - Secret Member)" : "Enable Incognito Mode"}
                  >
                    <IncognitoIcon size={22} className={isAnonymousMode ? "text-amber-400" : "text-gray-600"} />
                  </button>
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
            </>
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