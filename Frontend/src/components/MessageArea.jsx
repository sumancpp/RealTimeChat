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
  Bot,
  BarChart2,
  Code2,
  FileText,
  MessageSquare
} from "lucide-react";


import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import EmojiPicker from "emoji-picker-react";
import defaultProfile from "../assets/profile.png";

const ViewOnceCanvasViewer = ({ media, onClose, userData }) => {
  const canvasRef = useRef(null);
  const [isPressing, setIsPressing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);

  useEffect(() => {
    const handleHide = () => {
      setIsCaptured(true);
      setIsPressing(false);
    };

    window.addEventListener("blur", handleHide);
    const handleVis = () => {
      if (document.visibilityState === "hidden") {
        setIsCaptured(true);
        setIsPressing(false);
      }
    };
    document.addEventListener("visibilitychange", handleVis);

    return () => {
      window.removeEventListener("blur", handleHide);
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (isCaptured || !isPressing || !media?.image) {
      // Draw pitch black blank screen
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width || 300, canvas.height || 300);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = media.image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [isPressing, isCaptured, media?.image]);

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (!isCaptured) {
      setIsPressing(true);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsPressing(false);
  };

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className="fixed inset-0 z-[9999] bg-black/99 backdrop-blur-3xl flex items-center justify-center p-4 select-none touch-none"
    >
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 max-w-lg w-full text-white shadow-2xl flex flex-col items-center relative">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <span className="w-6 h-6 rounded-full border-2 border-emerald-400 flex items-center justify-center text-[11px] font-extrabold bg-emerald-500/20">1</span>
            <span>View Once Photo 🔒 (Hardware Screenshot Protected)</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
          >
            Close & Disintegrate ✕
          </button>
        </div>

        {/* SECURE CANVAS MEDIA CONTAINER */}
        <div 
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative w-full min-h-[320px] max-h-[65vh] rounded-2xl border border-slate-800 bg-black flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none touch-none"
        >
          <canvas 
            ref={canvasRef}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className={`max-h-[65vh] w-auto max-w-full rounded-2xl object-contain protected-media touch-none select-none pointer-events-none ${!isPressing || isCaptured ? 'hidden' : 'block'}`}
          />

          {(!isPressing || isCaptured) && (
            <div className="flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 shadow-xl shadow-emerald-500/10 animate-pulse">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="text-sm font-extrabold text-white mb-1">
                {isCaptured ? "🔒 Screenshot Blocked (Blank Screen Captured)" : "Press & Hold to Reveal Media"}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs font-medium">
                {isCaptured ? "Hardware screenshot detected. Screen flipped to black." : "Hold your finger on screen to view. Releasing turns screen pitch-black."}
              </p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-emerald-400/90 mt-3 font-semibold text-center bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
          🛡️ Hold finger to view • Releasing flips screen to 100% pitch-black
        </p>
      </div>
    </div>
  );
};

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
  replaceMessageRedux,
  updateViewOnceRedux
} from "../redux/messageSlice";

import {
  setSelectedUser,
  setOtherUsers,
  updateOtherUser,
  setUserData,
  updateSidebarOnMessage
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
    bg: "bg-[#f8fafc] text-slate-900",
    headerBg: "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 text-slate-900 shadow-sm",
    inputBg: "bg-white/95 backdrop-blur-xl border-t border-slate-200/90 text-slate-900 shadow-lg",
    inputTextBg: "bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500",
    titleText: "text-[#0b2a5b] font-extrabold",
    subtitleText: "text-slate-500 font-medium",
    iconColor: "text-slate-600 hover:text-slate-900",
    myBubble: "bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-sky-200",
    otherBubble: "bg-white text-slate-900 border border-slate-200/90 shadow-sm",
    font: "font-sans",
    name: "Bright Vibrant (Default)"
  },
  cyberpunk: {
    bg: "bg-gradient-to-br from-gray-950 via-purple-950 to-black animate-gradient",
    headerBg: "bg-gray-900/95 backdrop-blur-md border-b border-purple-500/40 text-purple-200",
    inputBg: "bg-gray-900/95 backdrop-blur-md border-t border-purple-500/40 text-purple-200",
    inputTextBg: "bg-gray-950 border border-purple-500/40 text-purple-100 placeholder-purple-400/60",
    titleText: "text-purple-300 font-bold",
    subtitleText: "text-purple-400/80",
    iconColor: "text-purple-400",
    myBubble: "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white border border-fuchsia-400/30",
    otherBubble: "bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-gray-600",
    font: "font-mono",
    name: "Cyberpunk"
  },
  sunset: {
    bg: "bg-gradient-to-br from-orange-100 via-rose-100 to-yellow-100 animate-gradient",
    headerBg: "bg-white/85 backdrop-blur-md border-b border-rose-200 text-rose-900",
    inputBg: "bg-white/85 backdrop-blur-md border-t border-rose-200 text-rose-900",
    inputTextBg: "bg-rose-50/80 border border-rose-200 text-rose-900 placeholder-rose-400",
    titleText: "text-rose-900 font-bold",
    subtitleText: "text-rose-600",
    iconColor: "text-rose-600",
    myBubble: "bg-gradient-to-r from-orange-500 to-rose-500 text-white",
    otherBubble: "bg-white/90 backdrop-blur-md text-gray-800 border border-white/50",
    font: "font-sans",
    name: "Sunset Bliss"
  },
  ocean: {
    bg: "bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 animate-gradient",
    headerBg: "bg-white/85 backdrop-blur-md border-b border-cyan-200 text-cyan-950",
    inputBg: "bg-white/85 backdrop-blur-md border-t border-cyan-200 text-cyan-950",
    inputTextBg: "bg-cyan-50/80 border border-cyan-200 text-cyan-950 placeholder-cyan-500",
    titleText: "text-cyan-950 font-bold",
    subtitleText: "text-cyan-700",
    iconColor: "text-cyan-700",
    myBubble: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white",
    otherBubble: "bg-white/90 backdrop-blur-md text-blue-900 border border-white/50",
    font: "font-serif",
    name: "Ocean Breeze"
  },
  forest: {
    bg: "bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50 animate-gradient",
    headerBg: "bg-white/85 backdrop-blur-md border-b border-emerald-200 text-emerald-950",
    inputBg: "bg-white/85 backdrop-blur-md border-t border-emerald-200 text-emerald-950",
    inputTextBg: "bg-emerald-50/80 border border-emerald-200 text-emerald-950 placeholder-emerald-500",
    titleText: "text-emerald-950 font-bold",
    subtitleText: "text-emerald-700",
    iconColor: "text-emerald-700",
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
  const [aiTypingTargetId, setAiTypingTargetId] = useState(null);
  const [deleteModalTarget, setDeleteModalTarget] = useState(null);

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
  const textareaRef = useRef(null);

  const messageContainerRef = useRef(null);

  const bottomRef = useRef(null);

  const adjustTextareaHeight = (element) => {
    const el = element || textareaRef.current;
    if (el) {
      if (!el.value || !el.value.trim()) {
        el.style.height = "44px";
        return;
      }
      el.style.height = "44px";
      const newHeight = Math.min(el.scrollHeight, 220); // ~9 lines max
      el.style.height = `${Math.max(44, newHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const [activeReactionMessage, setActiveReactionMessage] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);

  const [chatTheme, setChatTheme] = useState('default');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);

  // VIEW ONCE & IMAGE STATES
  const [isViewOnceMode, setIsViewOnceMode] = useState(false);
  const [viewOnceModalMedia, setViewOnceModalMedia] = useState(null);

  // REAL AI INTEGRATION STATES
  const [showAIHubModal, setShowAIHubModal] = useState(false);
  const [aiSummaryModal, setAiSummaryModal] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState("");
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  const [smartReplies, setSmartReplies] = useState([]);
  const [loadingSmartReplies, setLoadingSmartReplies] = useState(false);

  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [targetLang, setTargetLang] = useState("English");
  const [translateInputText, setTranslateInputText] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [loadingTranslate, setLoadingTranslate] = useState(false);

  const [showSentimentModal, setShowSentimentModal] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);

  const [showCodeReviewModal, setShowCodeReviewModal] = useState(false);
  const [codeSnippetText, setCodeSnippetText] = useState("");
  const [codeReviewLang, setCodeReviewLang] = useState("Auto-Detect");
  const [codeReviewResult, setCodeReviewResult] = useState("");
  const [loadingCodeReview, setLoadingCodeReview] = useState(false);

  const [showVoiceTranscribeModal, setShowVoiceTranscribeModal] = useState(false);
  const [transcribeResult, setTranscribeResult] = useState("");
  const [loadingTranscribe, setLoadingTranscribe] = useState(false);

  const handleFetchChatSentiment = async () => {
      if (!selectedUser?._id) return;
      setLoadingSentiment(true);
      setShowSentimentModal(true);
      setSentimentData(null);
      try {
          const res = await axios.get(`${serverUrl}/message/ai-sentiment/${selectedUser._id}`, { withCredentials: true });
          setSentimentData(res.data);
      } catch (err) {
          console.error("Sentiment error", err);
      } finally {
          setLoadingSentiment(false);
      }
  };

  const handleReviewCode = async () => {
      if (!codeSnippetText.trim()) return;
      setLoadingCodeReview(true);
      setCodeReviewResult("");
      try {
          const res = await axios.post(`${serverUrl}/message/ai-code-review`, { 
            code: codeSnippetText,
            language: codeReviewLang 
          }, { withCredentials: true });
          setCodeReviewResult(res.data.review || "Code review completed.");
      } catch (err) {
          console.error("Code review error", err);
          setCodeReviewResult("Failed to analyze code snippet.");
      } finally {
          setLoadingCodeReview(false);
      }
  };

  const handleTranscribeVoice = async (voiceUrl = "", audioText = "") => {
      setLoadingTranscribe(true);
      setShowVoiceTranscribeModal(true);
      setTranscribeResult("");
      try {
          const res = await axios.post(`${serverUrl}/message/ai-transcribe`, { audioText: audioText || "Hello my name is Suman", voiceUrl }, { withCredentials: true });
          setTranscribeResult(res.data.transcript || "Transcription completed.");
      } catch (err) {
          console.error("Transcribe error", err);
          setTranscribeResult("Failed to transcribe audio note.");
      } finally {
          setLoadingTranscribe(false);
      }
  };

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
      const text = textToTranslate || translateInputText || message || (messages && messages.length > 0 ? messages.filter(m => m.message && !m.isDeleted).slice(-1)[0]?.message : "");
      if (!text) {
          setTranslatedResult("Please enter text to translate.");
          return;
      }
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

    const handleViewOnceOpened = ({ messageId }) => {
      dispatch(updateViewOnceRedux({ messageId }));
    };

    socket.on("startMiniGame", handleStartMiniGame);
    socket.on("ticTacToeMove", handleTTTMove);
    socket.on("rpsChoice", handleRPSChoice);
    socket.on("viewOnceOpened", handleViewOnceOpened);

    return () => {
      socket.off("startMiniGame", handleStartMiniGame);
      socket.off("ticTacToeMove", handleTTTMove);
      socket.off("rpsChoice", handleRPSChoice);
      socket.off("viewOnceOpened", handleViewOnceOpened);
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

  const speechRecognitionRef = useRef(null);
  const liveAudioTranscriptRef = useRef("");

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

        if (liveAudioTranscriptRef.current) {
          formData.append("audioTranscript", liveAudioTranscriptRef.current);
        }

        const endpoint = selectedUser.isGroup ? `${serverUrl}/group/send/${selectedUser._id}` : `${serverUrl}/message/send/${selectedUser._id}`;
        const res = await axios.post(
          endpoint,
          formData,
          {
            withCredentials: true
          }
        );

        if (res?.data) {
          dispatch(addMessage(res.data));
          dispatch(updateSidebarOnMessage({
            newMessage: res.data,
            myId: userData?._id,
            currentChatId: selectedUser?._id
          }));
          liveAudioTranscriptRef.current = "";
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
      liveAudioTranscriptRef.current = "";

      // Initialize Web Speech API for live spoken transcript
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            let capturedText = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              capturedText += event.results[i][0].transcript;
            }
            if (capturedText) {
              liveAudioTranscriptRef.current = capturedText;
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (e) {
          console.log("Speech recognition error:", e);
        }
      }

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

    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
      speechRecognitionRef.current = null;
    }

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
          isGhost: Boolean(isGhostMode || (typeof message === 'string' && message?.startsWith('@ghost'))),
          isViewOnce: Boolean(isViewOnceMode),
          isViewOnceOpened: false,
          reactions: []
      };

      // Instantly dispatch to Redux to show it on screen
      dispatch(addMessage(optimisticMessage));

      // Capture inputs before clearing
      const messageTextToSend = message;
      const fileToSend = backendImage;
      const isViewOnceToSend = isViewOnceMode;

      // CLEAR AFTER OPTIMISTIC SUCCESS
      setMessage("");
      setReplyMessage(null);
      setFrontendImage(null);
      setBackendImage(null);
      setIsViewOnceMode(false);
      setIsGhostMode(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
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

      if (fileToSend) {
        formData.append(
          "file",
          fileToSend
        );
      }

      if (selectedUser?.isGroup && isAnonymousMode) {
        formData.append("isAnonymous", "true");
      }

      if (isGhostMode) {
        formData.append("isGhost", "true");
      }

      if (isViewOnceToSend) {
        formData.append("isViewOnce", "true");
      }

      const isAiTriggered = messageTextToSend?.trim().toLowerCase().startsWith("@ai") ||
                            messageTextToSend?.trim().toLowerCase() === "@roast" ||
                            messageTextToSend?.trim().toLowerCase() === "@music" ||
                            selectedUser?.isAI;
      
      if (isAiTriggered) {
          setAiTypingTargetId(selectedUser._id);
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
          withCredentials: true
        }
      );

      if (res.data) {
        if (res.data.aiMessage) {
          dispatch(replaceMessageRedux({ tempId, realMessage: res.data.message }));
          dispatch(addMessage(res.data.aiMessage));
          dispatch(updateSidebarOnMessage({
            newMessage: res.data.aiMessage,
            myId: userData?._id,
            currentChatId: selectedUser?._id
          }));
        } else if (res.data._id) {
          dispatch(replaceMessageRedux({ tempId, realMessage: res.data }));
          dispatch(updateSidebarOnMessage({
            newMessage: res.data,
            myId: userData?._id,
            currentChatId: selectedUser?._id
          }));
        }
      }

    }

    catch (error) {

      console.log(error);

    }

    finally {

      setSending(false);
      setAiTypingTargetId(null);

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

  const handleExecuteDelete = async (deleteForEveryone) => {
      if (!deleteModalTarget) return;
      if (deleteModalTarget.type === 'message') {
          if (deleteForEveryone) {
              await deleteMessageForEveryone(deleteModalTarget.messageId);
          } else {
              dispatch(deleteMessageRedux(deleteModalTarget.messageId));
          }
      } else if (deleteModalTarget.type === 'chat') {
          await handleDeleteChat(deleteForEveryone);
      }
      setDeleteModalTarget(null);
  };

  return (

    <div className={`w-full h-full min-h-0 flex flex-col overflow-hidden relative ${THEMES[chatTheme].bg} ${THEMES[chatTheme].font} transition-all duration-500`}>

      {selectedUser ? (

        <>

          {/* HEADER */}
          <div className={`w-full h-[70px] min-h-[70px] shrink-0 flex items-center px-4 shadow-sm z-50 transition-colors duration-300 ${THEMES[chatTheme]?.headerBg || 'bg-white border-b border-gray-300'}`}>

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
                className={THEMES[chatTheme]?.iconColor || "text-gray-700"}
              />

            </button>

            <div 
              className={`flex items-center flex-1 min-w-0 ${selectedUser?.isGroup ? 'cursor-pointer hover:opacity-80 py-1 px-2 -ml-2 rounded-xl transition-colors' : ''}`}
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
                className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-700/20"
              />

              <div className="ml-3 truncate">
                <div className="flex items-center gap-2">
                    <h2 className={`text-lg font-semibold truncate ${THEMES[chatTheme]?.titleText || 'text-[#0b2a5b]'}`}>
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

                <p className={`text-xs truncate ${THEMES[chatTheme]?.subtitleText || 'text-gray-500'}`}>
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
                <div ref={menuRef} className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)} 
                    className="hover:text-gray-700 hover:bg-gray-50 p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer"
                    title="Group Options"
                  >
                    <MoreVertical size={24} />
                  </button>

                  {showMenu && (
                    <div className="absolute top-12 right-0 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl w-64 z-50 flex flex-col overflow-hidden text-white font-sans animate-in fade-in duration-150">
                      {/* 1. Group Whiteboard */}
                      <button 
                        onClick={() => { setShowMenu(false); setShowDrawingCanvas(true); }} 
                        className="w-full text-left px-4 py-3 text-sm text-purple-400 hover:bg-slate-800 flex items-center gap-3 font-bold border-b border-slate-800 transition cursor-pointer"
                      >
                        <Palette size={18} className="text-purple-400 shrink-0" />
                        <span>Group Whiteboard</span>
                      </button>

                      {/* 2. The AI Features Hub */}
                      <button 
                        onClick={() => { setShowMenu(false); setShowAIHubModal(true); }} 
                        className="w-full text-left px-4 py-3 text-sm text-indigo-400 hover:bg-slate-800 flex items-center gap-3 font-bold border-b border-slate-800 transition cursor-pointer"
                      >
                        <Sparkles size={18} className="text-indigo-400 animate-pulse shrink-0" />
                        <span>The AI Features Hub</span>
                      </button>

                      {/* 3. Theme */}
                      <button 
                        onClick={() => setShowThemeMenu(!showThemeMenu)} 
                        className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-3 font-semibold border-b border-slate-800 transition cursor-pointer"
                      >
                        <Edit3 size={18} className="text-blue-400 shrink-0" />
                        <span className="flex-1">Theme: {THEMES[chatTheme]?.name || "Default"}</span>
                      </button>
                      {showThemeMenu && (
                        <div className="bg-slate-950 border-b border-slate-800">
                          {Object.keys(THEMES).map(key => (
                            <button 
                              key={key} 
                              onClick={() => { changeTheme(key); setShowMenu(false); }}
                              className={`w-full text-left px-8 py-2 text-xs hover:bg-slate-800 transition cursor-pointer ${chatTheme === key ? 'font-bold text-indigo-400' : 'text-slate-400'}`}
                            >
                              {THEMES[key].name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 4. AI Chat Vibe & Sentiment Meter */}
                      <button 
                        onClick={() => { 
                          setShowMenu(false); 
                          handleFetchChatSentiment(); 
                          setShowSentimentModal(true); 
                        }} 
                        className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-slate-800 flex items-center gap-3 font-bold transition cursor-pointer"
                      >
                        <BarChart2 size={18} className="text-emerald-400 shrink-0" />
                        <span>AI Chat Vibe & Sentiment Meter</span>
                      </button>
                    </div>
                  )}
                </div>
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
                      <div className="absolute top-12 right-0 bg-[#0e1322]/95 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl rounded-2xl w-60 z-50 flex flex-col overflow-hidden text-slate-100 font-sans animate-in fade-in duration-150">
                        {/* 1. AI Features Hub */}
                        <button onClick={() => { setShowMenu(false); setShowAIHubModal(true); }} className="w-full text-left px-4 py-3 text-sm text-indigo-400 hover:bg-slate-800 flex items-center gap-3 font-bold border-b border-slate-800 transition cursor-pointer">
                            <Sparkles size={18} className="text-indigo-400 animate-pulse shrink-0" /> <span>AI Features Hub</span>
                        </button>

                        {/* 2. Play Chat Story */}
                        <button onClick={() => { setShowChatReplay(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-slate-800 flex items-center gap-3 font-semibold border-b border-slate-800 transition cursor-pointer">
                            <Film size={18} className="text-emerald-400 shrink-0" /> <span>Play Chat Story</span>
                        </button>

                        {/* 3. Play Mini-Game Duel */}
                        <button onClick={() => { 
                            setShowMenu(false); 
                            if (selectedUser?._id) {
                                setShowGamePicker(true);
                            }
                        }} className="w-full text-left px-4 py-3 text-sm text-amber-400 hover:bg-slate-800 flex items-center gap-3 font-semibold border-b border-slate-800 transition cursor-pointer">
                            <Swords size={18} className="text-amber-400 shrink-0" /> <span>Play Mini-Game Duel</span>
                        </button>

                        {/* 4. Ghost Ink Mode */}
                        <button onClick={() => { setIsGhostMode(!isGhostMode); setShowMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 font-semibold border-b border-slate-800 transition cursor-pointer ${isGhostMode ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-purple-400 hover:bg-slate-800'}`}>
                            <Ghost size={18} className="shrink-0" /> <span>{isGhostMode ? "Ghost Ink Mode (ON)" : "Ghost Ink Mode"}</span>
                        </button>

                        {/* 5. Theme */}
                        <button onClick={() => setShowThemeMenu(!showThemeMenu)} className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-3 font-semibold border-b border-slate-800 transition cursor-pointer">
                            <Edit3 size={18} className="text-blue-400 shrink-0" /> <span className="flex-1">Theme: {THEMES[chatTheme]?.name || "Default"}</span>
                        </button>
                        {showThemeMenu && (
                            <div className="bg-slate-950 border-b border-slate-800">
                                {Object.keys(THEMES).map(key => (
                                    <button 
                                        key={key} 
                                        onClick={() => { changeTheme(key); setShowMenu(false); }}
                                        className={`w-full text-left px-8 py-2 text-xs hover:bg-slate-800 transition cursor-pointer ${chatTheme === key ? 'font-bold text-indigo-400' : 'text-slate-400'}`}
                                    >
                                        {THEMES[key].name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 6. Block User */}
                        <button onClick={handleBlockToggle} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 font-semibold border-b border-slate-800 transition cursor-pointer">
                            <Ban size={18} className={userData?.blockedUsers?.includes(selectedUser._id) ? "text-emerald-400 shrink-0" : "text-rose-400 shrink-0"} />
                            <span>{userData?.blockedUsers?.includes(selectedUser._id) ? "Unblock User" : "Block User"}</span>
                        </button>

                        {/* 7. Delete Chat */}
                        <button onClick={() => { setShowMenu(false); setDeleteModalTarget({ type: 'chat', isSender: true }); }} className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/20 flex items-center gap-3 font-bold transition cursor-pointer">
                            <Trash2 size={18} className="text-rose-400 shrink-0" /> <span>Delete Conversation</span>
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
                      const initialText = message || (messages && messages.length > 0 ? messages.filter(m => m.message && !m.isDeleted).slice(-1)[0]?.message : "");
                      setTranslateInputText(initialText || "");
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

                  {/* 6. AI Code Reviewer & Analyzer */}
                  <button
                    onClick={() => {
                      setShowAIHubModal(false);
                      setShowCodeReviewModal(true);
                    }}
                    className="flex items-center gap-3 p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Code2 size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-blue-300">💻 AI Code Reviewer</h4>
                      <p className="text-xs text-slate-400">Detect bugs & get AI code optimizations</p>
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
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl animate-in zoom-in-95 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                      <Languages size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-white">🌐 AI Real-Time Translator</h3>
                      <p className="text-[11px] text-cyan-300">Translate messages instantly into any language</p>
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
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Text to Translate:</label>
                    <textarea
                      value={translateInputText || ""}
                      onChange={(e) => setTranslateInputText(e.target.value)}
                      placeholder="Type or paste any text to translate..."
                      className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500 resize-none font-sans"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Target:</label>
                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-500 cursor-pointer w-full"
                      >
                        {["English", "Bengali", "Hindi", "Spanish", "French", "German", "Japanese", "Mandarin", "Arabic", "Russian", "Italian", "Portuguese"].map((lang) => (
                          <option key={lang} value={lang}>{lang === "Bengali" ? "Bengali (বাংলা)" : lang}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => handleTranslateText()}
                      disabled={loadingTranslate}
                      className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md whitespace-nowrap"
                    >
                      {loadingTranslate ? "Translating..." : "Translate Now"}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-sm min-h-[100px] max-h-[160px] overflow-y-auto text-slate-200 font-sans">
                    {loadingTranslate ? (
                      <div className="flex items-center justify-center h-20 text-cyan-400 gap-2">
                        <Languages size={20} className="animate-spin text-cyan-500" />
                        <span className="text-xs">Translating...</span>
                      </div>
                    ) : translatedResult ? (
                      <div>
                        <span className="text-xs font-bold text-cyan-400 block mb-1">Result ({targetLang}):</span>
                        <p className="text-sm font-medium whitespace-pre-wrap">{translatedResult}</p>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic">Select a language and click "Translate Now" to translate the message.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2.5 justify-end">
                  {translatedResult && (
                    <button
                      onClick={() => {
                        setMessage(translatedResult);
                        setShowTranslateModal(false);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
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

          {/* AI SENTIMENT / VIBE METER MODAL */}
          {showSentimentModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl animate-in zoom-in-95 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                      <BarChart2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-white">📊 AI Chat Vibe & Sentiment Meter</h3>
                      <p className="text-[11px] text-emerald-300">Live mood analysis for {selectedUser?.name || "Chat"}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSentimentModal(false)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {loadingSentiment ? (
                    <div className="flex flex-col items-center justify-center h-40 text-emerald-400 gap-3">
                      <Sparkles size={28} className="animate-spin text-emerald-500" />
                      <span className="text-xs font-semibold">Analyzing chat sentiment & conversation vibe...</span>
                    </div>
                  ) : sentimentData ? (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                          <span className="text-xs text-slate-400 font-semibold mb-1">Chat Vibe</span>
                          <span className="text-sm font-extrabold text-emerald-400">{sentimentData.vibe || "🔥 Warm & Active"}</span>
                        </div>
                        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                          <span className="text-xs text-slate-400 font-semibold mb-1">Positivity Score</span>
                          <span className="text-base font-extrabold text-cyan-400">{sentimentData.score || "88%"}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200">
                        <span className="text-xs font-bold text-emerald-400 block mb-1">Overall Sentiment Summary:</span>
                        <p className="leading-relaxed font-sans">{sentimentData.summary || "Conversation shows high engagement and friendly rapport."}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic text-center py-6">Failed to load chat sentiment analysis.</p>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowSentimentModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI CODE REVIEWER MODAL */}
          {showCodeReviewModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl p-4 sm:p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl shadow-cyan-500/10 animate-in zoom-in-95 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 text-cyan-400 rounded-2xl border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
                      <Code2 size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
                          💻 AI Code Reviewer & Bug Detector
                        </h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          PRO ⚡
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Detect bugs, fix syntax, and view expected execution output</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCodeReviewModal(false)}
                    className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cyan-400 font-bold px-1">🌐 Target Language:</span>
                    </div>
                    <select
                      value={codeReviewLang}
                      onChange={(e) => setCodeReviewLang(e.target.value)}
                      className="bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold outline-none focus:border-cyan-400 cursor-pointer shadow-md"
                    >
                      <option value="Auto-Detect">✨ ✨ Auto-Detect Language</option>
                      <option value="Python">🐍 Python</option>
                      <option value="JavaScript">🟨 JavaScript</option>
                      <option value="TypeScript">🟦 TypeScript</option>
                      <option value="C++">⚡ C++</option>
                      <option value="Java">☕ Java</option>
                      <option value="HTML/CSS">🌐 HTML/CSS</option>
                      <option value="PHP">🐘 PHP</option>
                      <option value="SQL">🗄️ SQL</option>
                      <option value="Go">🐹 Go</option>
                      <option value="Rust">🦀 Rust</option>
                    </select>
                  </div>

                  <div className="relative group">
                    <textarea
                      value={codeSnippetText}
                      onChange={(e) => setCodeSnippetText(e.target.value)}
                      placeholder="Paste your code snippet here (e.g. print(Hello), console.log(x), etc.)..."
                      className="w-full h-32 bg-[#060a14] border border-slate-800/90 focus:border-cyan-500/60 rounded-2xl p-3.5 text-xs text-cyan-200 font-mono outline-none resize-none transition-colors shadow-inner"
                    />
                    {codeSnippetText && (
                      <span className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
                        {codeSnippetText.length} chars
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleReviewCode()}
                    disabled={loadingCodeReview || !codeSnippetText.trim()}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-fuchsia-500 text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-cyan-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {loadingCodeReview ? (
                      <>
                        <Code2 size={16} className="animate-spin text-cyan-300" />
                        <span>Analyzing Syntax & Detecting Bugs with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base">⚡</span>
                        <span>Analyze & Review Code Now</span>
                      </>
                    )}
                  </button>

                  {/* RESULT OUTPUT CONTAINER */}
                  <div className="bg-[#050811] p-4 rounded-2xl border border-slate-800 text-xs min-h-[140px] max-h-[260px] overflow-y-auto text-slate-200 font-sans shadow-inner scrollbar-hide">
                    {loadingCodeReview ? (
                      <div className="flex flex-col items-center justify-center h-28 text-cyan-400 gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                          <Code2 size={18} className="text-cyan-300" />
                        </div>
                        <p className="text-xs font-semibold animate-pulse text-cyan-300">Auditing logic, syntax errors, and preparing execution output...</p>
                      </div>
                    ) : codeReviewResult ? (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-1">
                          <span className="text-[11px] font-extrabold text-cyan-400 flex items-center gap-1.5">
                            <span>🚀 Review Results & Output</span>
                          </span>
                          <button
                            onClick={() => navigator.clipboard.writeText(codeReviewResult)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-800 transition cursor-pointer flex items-center gap-1"
                          >
                            <span>📋</span> Copy Report
                          </button>
                        </div>
                        <div className="whitespace-pre-wrap font-mono text-[11px] text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                          {codeReviewResult}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-28 text-slate-500 gap-2 text-center p-4">
                        <span className="text-2xl">👨‍💻</span>
                        <p className="text-xs font-medium">Paste your code snippet above and click <span className="text-cyan-400 font-bold">"Analyze & Review Code"</span>.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2.5 justify-end border-t border-slate-800/80 pt-3">
                  {codeReviewResult && (
                    <button
                      onClick={() => {
                        setMessage(codeReviewResult);
                        setShowCodeReviewModal(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md shadow-cyan-500/10 flex items-center gap-1.5"
                    >
                      <span>💬</span> Share Review in Chat
                    </button>
                  )}
                  <button
                    onClick={() => setShowCodeReviewModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer border border-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI VOICE TRANSCRIBER MODAL */}
          {showVoiceTranscribeModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl animate-in zoom-in-95 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-white">🎙️ AI Voice Note Transcriber</h3>
                      <p className="text-[11px] text-amber-300">Speech-to-text transcript & summary</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowVoiceTranscribeModal(false)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs min-h-[120px] text-slate-200 font-sans">
                    {loadingTranscribe ? (
                      <div className="flex items-center justify-center h-20 text-amber-400 gap-2">
                        <FileText size={20} className="animate-spin text-amber-500" />
                        <span className="text-xs">Transcribing audio speech to text...</span>
                      </div>
                    ) : transcribeResult ? (
                      <div>
                        <span className="text-xs font-bold text-amber-400 block mb-1">Transcript & Summary:</span>
                        <p className="text-xs leading-relaxed font-sans">{transcribeResult}</p>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic">No transcript generated.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2.5 justify-end">
                  {transcribeResult && (
                    <button
                      onClick={() => {
                        setMessage(transcribeResult);
                        setShowVoiceTranscribeModal(false);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
                    >
                      Insert in Chat
                    </button>
                  )}
                  <button
                    onClick={() => setShowVoiceTranscribeModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW ONCE MEDIA MODAL (Mobile Screenshot-Proof Canvas Viewer) */}
          {viewOnceModalMedia && (
            <ViewOnceCanvasViewer 
              media={viewOnceModalMedia}
              userData={userData}
              onClose={async () => {
                const msgId = viewOnceModalMedia._id;
                setViewOnceModalMedia(null);
                if (msgId) {
                  try {
                    await axios.post(`${serverUrl}/message/open-view-once/${msgId}`, {}, { withCredentials: true });
                    dispatch(updateViewOnceRedux({ messageId: msgId }));
                  } catch (e) {
                    console.error("Error opening view once message", e);
                  }
                }
              }}
            />
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
            className="flex-1 min-h-0 overflow-y-auto px-4 py-5 font-sans"
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
                      msg.isViewOnce ? (
                        msg.isViewOnceOpened ? (
                          <div className="flex items-center gap-2 bg-slate-200/80 text-slate-600 px-3 py-2 rounded-xl text-xs font-semibold mb-2 border border-slate-300">
                            <span className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-bold">1</span>
                            <span>Photo • Opened 👁️</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if ((msg.sender?._id || msg.sender)?.toString() === userData?._id?.toString()) {
                                alert("View Once photo sent (Waiting for recipient to open)");
                              } else {
                                setViewOnceModalMedia(msg);
                              }
                            }}
                            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold mb-2 transition cursor-pointer shadow-sm active:scale-95"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-extrabold">1</span>
                            <span>{(msg.sender?._id || msg.sender)?.toString() === userData?._id?.toString() ? "Photo (View Once Sent)" : "Photo (Tap to View 👁️)"}</span>
                          </button>
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
                      <div className="flex flex-col gap-1 mb-2">
                        <audio
                          controls
                          src={msg.voice}
                          className="w-[250px]"
                        />
                        <button
                          onClick={() => handleTranscribeVoice(msg.voice, msg.audioTranscript || msg.text)}
                          className="self-start text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <FileText size={12} /> Transcribe Audio
                        </button>
                      </div>
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

                          {msg.message && !msg.isDeleted && (
                            <button
                              title="Translate Message"
                              onClick={() => {
                                setTranslateInputText(msg.message);
                                setShowTranslateModal(true);
                                setActiveReactionMessage(null);
                                handleTranslateText(msg.message);
                              }}
                              className="text-cyan-600 hover:text-cyan-500 font-bold px-1.5 transition cursor-pointer flex items-center gap-1"
                            >
                              <Languages size={18} />
                            </button>
                          )}

                          {msg.sender?.toString() === userData?._id?.toString() && (
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
                              className="text-blue-500 font-bold px-2 cursor-pointer hover:scale-110 transition-transform"
                              title="Edit Message"
                            >
                              <Edit3 size={20} />
                            </button>
                          )}

                          {!msg.isDeleted && (
                            <button
                              onClick={() => {
                                setDeleteModalTarget({
                                  type: 'message',
                                  messageId: msg._id,
                                  isSender: msg.sender?.toString() === userData?._id?.toString()
                                });
                                setActiveReactionMessage(null);
                              }}
                              className="text-rose-500 font-bold px-2 cursor-pointer hover:scale-110 transition-transform"
                              title="Delete Message"
                            >
                              <Trash2 size={20} />
                            </button>
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

            {aiTypingTargetId && aiTypingTargetId === selectedUser?._id && (
              <div className="flex mb-4 justify-start">
                <div className="relative py-2 px-4 max-w-[80%] sm:max-w-[70%] bg-transparent">
                  <div className="flex items-center text-cyan-400 text-sm font-semibold animate-pulse gap-1.5">
                    <span className="text-base">✨</span> BaatCheet AI Thinking...
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef}></div>

          </div>

          {/* IMAGE PREVIEW */}
          {frontendImage && (
            <div className="px-4 py-2 relative w-max flex flex-col gap-2">
              <div className="relative group">
                <img
                  src={frontendImage}
                  alt="preview"
                  className={`w-32 h-32 rounded-2xl object-cover border-2 border-orange-400 shadow-md ${sending ? 'opacity-50' : ''}`}
                />
                {!sending && (
                  <button
                    type="button"
                    onClick={() => {
                      setFrontendImage(null);
                      setBackendImage(null);
                      setIsViewOnceMode(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition-transform hover:scale-110 cursor-pointer z-10"
                    title="Unselect Image"
                  >
                    <X size={14} />
                  </button>
                )}
                {sending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* VIEW ONCE TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setIsViewOnceMode(!isViewOnceMode)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm w-fit ${isViewOnceMode ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 scale-105' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                title="Toggle View Once (Recipient can view photo only 1 time)"
              >
                <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-extrabold">1</span>
                {isViewOnceMode ? "View Once ON" : "View Once"}
              </button>
            </div>
          )}

          {selectedImage && (
            <div
              className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white text-3xl p-2 hover:bg-white/20 rounded-full transition cursor-pointer"
              >
                ✕
              </button>
              <img
                src={selectedImage}
                alt="fullscreen"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
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
              {/* AI SMART REPLIES THINKING ANIMATION */}
              {loadingSmartReplies && (
                <div className="w-full bg-slate-900 border-t border-purple-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-purple-300 shadow-inner animate-in slide-in-from-bottom-2 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400 animate-spin" />
                    <span className="font-bold text-purple-200">AI is thinking smart replies...</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              {/* AI SMART REPLIES RESULTS */}
              {!loadingSmartReplies && smartReplies && smartReplies.length > 0 && (
                <div className="w-full bg-purple-950/80 border-t border-purple-500/40 px-3 py-2 flex items-center gap-2 flex-wrap text-xs shadow-inner animate-in slide-in-from-bottom-2 backdrop-blur-md">
                  <span className="font-bold text-purple-300 flex items-center gap-1">
                    <Sparkles size={14} className="text-purple-400 animate-pulse" /> AI Smart Replies:
                  </span>
                  {smartReplies.map((reply, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setMessage(reply);
                        setSmartReplies([]);
                      }}
                      className="bg-purple-900/90 hover:bg-purple-600 text-purple-100 hover:text-white border border-purple-500/50 px-3 py-1 rounded-full font-medium shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      {reply}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSmartReplies([])}
                    className="ml-auto text-purple-400 hover:text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form
                onSubmit={
                  handleSendMessage
                }
                className={`w-full px-2 sm:px-3 py-2 flex items-center gap-2 transition-colors duration-300 ${THEMES[chatTheme]?.inputBg || 'bg-white border-t border-gray-300'}`}
              >

              {/* EMOJI */}
              <button
                type="button"
                onClick={() =>
                  setShowPicker(
                    (prev) => !prev
                  )
                }
                className={THEMES[chatTheme]?.iconColor || "text-gray-700"}
              >

                <Smile size={22} />

              </button>


              {/* IMAGE */}
              <label className={`cursor-pointer ${THEMES[chatTheme]?.iconColor || "text-gray-700"}`}>

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
                ref={textareaRef}
                value={message}
                rows={1}
                onChange={(e) => {
                  setMessage(e.target.value);
                  adjustTextareaHeight(e.target);

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
                    if (textareaRef.current) textareaRef.current.style.height = "44px";
                  }
                }}
                placeholder={isGhostMode ? "Ghost Ink Mode 👻 (Disintegrates 5s after reading)" : "Type a message..."}
                className={`
flex-1
min-w-0
resize-none
max-h-[220px]
px-4
py-2.5
rounded-3xl
${isGhostMode ? 'bg-purple-50 border-2 border-purple-500/80 text-purple-950 font-medium' : (THEMES[chatTheme]?.inputTextBg || 'bg-slate-100 text-gray-800')}
outline-none
overflow-y-auto
text-sm
transition-[height] duration-100
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
        <div className="hidden lg:flex flex-1 items-center justify-center flex-col bg-[#05070e] relative overflow-hidden text-slate-100 p-8 border-l border-cyan-500/15">
          {/* Cyber Ambient Glowing Blobs */}
          <div className="w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-glow pointer-events-none absolute" />
          <div className="w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-glow pointer-events-none absolute" style={{ animationDelay: '2.5s' }} />

          <div className="relative z-10 flex flex-col items-center text-center max-w-md glass-panel p-10 rounded-3xl border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[2px] shadow-xl shadow-cyan-500/20 mb-4 animate-float">
              <div className="w-full h-full bg-[#090d18] rounded-[14px] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-2 mb-2">
              <span>Baat</span>
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                Cheet
              </span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
              Select a contact or group from the sidebar to start live messaging, WebRTC audio/video calls, voice notes, and mini-game duels!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#090d18] border border-cyan-500/20 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
                <Phone size={14} className="text-emerald-400" /> HD Calls
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#090d18] border border-cyan-500/20 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
                <Ghost size={14} className="text-pink-400" /> Ghost Mode
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#090d18] border border-cyan-500/20 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
                <Swords size={14} className="text-amber-400" /> Game Duels
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DELETE OPTIONS MODAL (Delete for me vs Delete for everyone) */}
      <AnimatePresence>
        {deleteModalTarget && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel border border-cyan-500/20 rounded-3xl w-full max-w-sm p-6 text-slate-100 shadow-2xl backdrop-blur-2xl flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-1 shadow-lg">
                <Trash2 size={24} />
              </div>
              
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {deleteModalTarget.type === 'message' ? 'Delete Message?' : 'Delete Conversation?'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Choose how you would like to remove this {deleteModalTarget.type}.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                {/* Delete for Me */}
                <button
                  onClick={() => handleExecuteDelete(false)}
                  className="w-full py-3 rounded-2xl bg-[#090d18] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Trash2 size={16} className="text-slate-400" />
                  <span>Delete for me</span>
                </button>

                {/* Delete for Everyone (if sender or chat delete) */}
                {(deleteModalTarget.isSender || deleteModalTarget.type === 'chat') && (
                  <button
                    onClick={() => handleExecuteDelete(true)}
                    className="w-full py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete for everyone</span>
                  </button>
                )}

                {/* Cancel */}
                <button
                  onClick={() => setDeleteModalTarget(null)}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>

  );

};

export default MessageArea;