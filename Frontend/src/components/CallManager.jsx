import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, PhoneOff, Mic, MicOff, Camera as CameraIcon, CameraOff, MonitorUp, MonitorOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import { serverUrl } from '../config';
import { getSocket } from '../socket'; 
import defaultProfile from '../assets/profile.png';
const CallManager = () => {
    const { userData, otherUsers, onlineUsers } = useSelector(state => state.user);
    
    // Call States
    const [callState, setCallState] = useState('idle'); // idle, ringing, calling, connected
    const [callType, setCallType] = useState('video'); // video, voice
    const [remoteUser, setRemoteUser] = useState(null);
    
    // Media States
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [micMuted, setMicMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Refs
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const iceCandidateQueue = useRef([]);

    useEffect(() => {
        const socket = getSocket();
        console.log("[WebRTC] CallManager useEffect evaluating. Socket available:", !!socket);
        if (!socket) return;

        // Custom Event from MessageArea to start a call
        const handleStartCall = (e) => {
            const { userToCall, type } = e.detail;
            setRemoteUser(userToCall);
            setCallType(type);
            setCallState('calling');
            
            // Start local media
            startLocalMedia(type).then(stream => {
                const socket = getSocket();
                if (socket) socket.emit("callUser", { userToCall: userToCall._id, callType: type });
                
                // Save Call History
                import('axios').then((axios) => {
                    axios.default.post(`${serverUrl}/call/history`, { receiverId: userToCall._id, callType: type }, { withCredentials: true })
                        .catch(err => console.error("Failed to save call history", err));
                });
            });
        };

        window.addEventListener('startCall', handleStartCall);

        // Socket Events
        if (!socket) return;

        socket.on("incomingCall", async ({ from, callType }) => {
            console.log(`[WebRTC] incomingCall received from ${from}, current callState: ${callState}`);
            if (callState !== 'idle') {
                // Already in a call, reject
                socket.emit("rejectCall", { to: from });
                return;
            }
            const caller = otherUsers.find(u => u._id === from) || { _id: from, name: "Unknown" };
            setRemoteUser(caller);
            setCallType(callType);
            setCallState('ringing');
        });

        socket.on("callRejected", () => {
            endCallLocally();
            alert("Call declined");
        });

        socket.on("callAccepted", async () => {
            // Caller starts WebRTC process by creating an Offer
            setCallState('connected');
            await initWebRTC(true);
        });

        socket.on("webrtcSignal", async ({ signalData, from }) => {
            if (!peerConnectionRef.current) {
                // If receiver gets signal before connection is init (shouldn't happen if they answer first)
                await initWebRTC(false);
            }
            
            try {
                if (signalData.type === 'offer') {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
                    const answer = await peerConnectionRef.current.createAnswer();
                    await peerConnectionRef.current.setLocalDescription(answer);
                    socket.emit("webrtcSignal", { to: from, signalData: peerConnectionRef.current.localDescription });
                    
                    // Process queued ICE candidates
                    while (iceCandidateQueue.current.length > 0) {
                        const candidate = iceCandidateQueue.current.shift();
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                } else if (signalData.type === 'answer') {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
                    
                    // Process queued ICE candidates
                    while (iceCandidateQueue.current.length > 0) {
                        const candidate = iceCandidateQueue.current.shift();
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                } else if (signalData.candidate) {
                    if (peerConnectionRef.current.remoteDescription) {
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signalData));
                    } else {
                        iceCandidateQueue.current.push(signalData);
                    }
                }
            } catch (err) {
                console.log("WebRTC Signal Error", err);
            }
        });

        socket.on("callEnded", () => {
            endCallLocally();
        });

        socket.on("screenShareStopped", () => {
            if (remoteStream) {
                const videoTracks = remoteStream.getVideoTracks();
                videoTracks.forEach(track => {
                    track.stop();
                    remoteStream.removeTrack(track);
                });
                setRemoteStream(new MediaStream(remoteStream.getAudioTracks()));
            }
        });

        return () => {
            window.removeEventListener('startCall', handleStartCall);
            socket.off("incomingCall");
            socket.off("callRejected");
            socket.off("callAccepted");
            socket.off("webrtcSignal");
            socket.off("callEnded");
            socket.off("screenShareStopped");
        };
    }, [callState, otherUsers, onlineUsers]);

    // Attach streams to video elements
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(e => console.log("Video auto-play prevented:", e));
        }
        // If it's a voice call, we still need an audio element to play the stream
        const audioElement = document.getElementById('remoteAudio');
        if (audioElement && remoteStream) {
            audioElement.srcObject = remoteStream;
            audioElement.play().catch(e => console.log("Audio auto-play prevented:", e));
        }
    }, [remoteStream, callState, isScreenSharing]);

    const startLocalMedia = async (type) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: type === 'video', 
                audio: true 
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (err) {
            console.error("Failed to get local stream", err);
            alert("Microphone/Camera permission denied.");
            endCallLocally();
            return null;
        }
    };

    const initWebRTC = async (isCaller) => {
        const configuration = { 'iceServers': [
            { 'urls': 'stun:stun.l.google.com:19302' },
            { 'urls': 'stun:stun.cloudflare.com:3478' }
        ] };
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Add local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current);
            });
        }

        // Listen for remote stream
        const remoteMediaStream = new MediaStream();
        peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            } else {
                remoteMediaStream.addTrack(event.track);
                setRemoteStream(new MediaStream(remoteMediaStream.getTracks()));
            }
        };

        // ICE Candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                const socket = getSocket();
                if (socket) socket.emit("webrtcSignal", { to: remoteUser._id, signalData: event.candidate });
            }
        };

        if (isCaller) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            const socket = getSocket();
            if (socket) socket.emit("webrtcSignal", { to: remoteUser._id, signalData: peerConnection.localDescription });
        }
    };

    const answerCall = async () => {
        // Instantly update UI so the user doesn't feel a lag while camera/mic initializes
        setCallState('connected'); 
        
        await startLocalMedia(callType);
        const socket = getSocket();
        if (socket) socket.emit("acceptCall", { to: remoteUser._id });
        await initWebRTC(false); // Initialize but wait for offer
    };

    const rejectCall = () => {
        const socket = getSocket();
        if (socket) socket.emit("rejectCall", { to: remoteUser._id });
        endCallLocally();
    };

    const endCall = () => {
        const socket = getSocket();
        if (socket) socket.emit("endCall", { to: remoteUser._id });
        endCallLocally();
    };

    const endCallLocally = () => {
        setCallState('idle');
        setRemoteUser(null);
        setRemoteStream(null);
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        setIsScreenSharing(false);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            localStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        iceCandidateQueue.current = [];
        setMicMuted(false);
        setVideoMuted(false);
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            stopScreenShare();
            return;
        }

        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
            alert("🖥️ Screen Sharing Notice:\n\nScreen sharing is a Desktop WebRTC feature. Mobile operating systems (Android Chrome / iOS Safari) do not allow website screen recording in mobile web browsers.\n\nPlease open BaatCheet on a laptop or desktop computer (Windows/Mac/Linux) to use 1-Click Screen Sharing!");
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            screenStreamRef.current = screenStream;
            const screenTrack = screenStream.getVideoTracks()[0];

            if (peerConnectionRef.current) {
                const senders = peerConnectionRef.current.getSenders();
                let videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (!videoSender) {
                    videoSender = senders.find(s => !s.track || (s.kind && s.kind === 'video'));
                }

                if (videoSender) {
                    await videoSender.replaceTrack(screenTrack);
                } else {
                    peerConnectionRef.current.addTrack(screenTrack, screenStream);
                    const offer = await peerConnectionRef.current.createOffer();
                    await peerConnectionRef.current.setLocalDescription(offer);
                    const socket = getSocket();
                    if (socket && remoteUser?._id) {
                        socket.emit("webrtcSignal", { to: remoteUser._id, signalData: peerConnectionRef.current.localDescription });
                    }
                }
            }

            setLocalStream(screenStream);
            setIsScreenSharing(true);

            screenTrack.onended = () => {
                stopScreenShare();
            };
        } catch (err) {
            console.error("Screen sharing cancelled or error:", err);
            if (err.name !== 'NotAllowedError') {
                alert("Screen Share Error: " + (err.message || "Failed to start screen sharing"));
            }
        }
    };

    const stopScreenShare = async () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }

        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        if (peerConnectionRef.current) {
            const senders = peerConnectionRef.current.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender) {
                if (cameraTrack) {
                    await videoSender.replaceTrack(cameraTrack);
                } else {
                    try {
                        peerConnectionRef.current.removeTrack(videoSender);
                    } catch(e) {}
                }
            }
        }

        if (localStreamRef.current) {
            setLocalStream(localStreamRef.current);
        }

        setIsScreenSharing(false);

        // Notify remote user via Socket.IO so screen sharing stops on BOTH devices instantly!
        const socket = getSocket();
        if (socket && remoteUser?._id) {
            socket.emit("stopScreenShareSignal", { to: remoteUser._id });
        }
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = micMuted;
            setMicMuted(!micMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream && callType === 'video') {
            localStream.getVideoTracks()[0].enabled = videoMuted;
            setVideoMuted(!videoMuted);
        }
    };

    if (callState === 'idle') return null;

    return (
        <AnimatePresence>
            {/* Incoming Call Overlay */}
            {callState === 'ringing' && (
                <motion.div 
                    initial={{ top: -150, opacity: 0 }} 
                    animate={{ top: 16, opacity: 1 }}
                    exit={{ top: -150, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed left-1/2 transform -translate-x-1/2 w-[95%] max-w-md bg-gray-900 text-white rounded-2xl p-4 shadow-2xl z-[9999] flex items-center justify-between border border-gray-700"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative">
                            <img src={remoteUser?.profileImage || defaultProfile} className="w-12 h-12 rounded-full object-cover border border-green-500" alt="caller" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h3 className="font-bold text-md truncate">{remoteUser?.name || remoteUser?.userName}</h3>
                            <p className="text-gray-400 text-xs truncate">{callType === 'video' ? 'Incoming Video Call...' : 'Incoming Voice Call...'}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                        <button onClick={rejectCall} className="bg-red-500 p-3 rounded-full hover:bg-red-600 transition shadow-lg">
                            <PhoneOff size={20} />
                        </button>
                        <button onClick={answerCall} className="bg-green-500 p-3 rounded-full hover:bg-green-600 transition shadow-lg animate-bounce">
                            {callType === 'video' ? <Video size={20} /> : <Phone size={20} />}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Active/Outgoing Call Fullscreen Overlay */}
            {(callState === 'calling' || callState === 'connected') && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-gray-900 z-[998] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold drop-shadow-md">{remoteUser?.name || remoteUser?.userName}</h2>
                            <p className="text-gray-300 drop-shadow-md">{callState === 'calling' ? 'Calling...' : '00:00'}</p>
                        </div>
                        {isScreenSharing && (
                            <div className="bg-blue-600/90 text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                                Screen Sharing Active
                            </div>
                        )}
                    </div>

                    {/* Video / Audio Area */}
                    <div className="flex-1 relative flex items-center justify-center">
                        {(callType === 'video' || isScreenSharing || (remoteStream && remoteStream.getVideoTracks && remoteStream.getVideoTracks().length > 0)) ? (
                            <>
                                {/* Remote Video / Screen */}
                                {remoteStream ? (
                                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <img src={remoteUser?.profileImage || defaultProfile} className="w-32 h-32 rounded-full mb-4 opacity-50" />
                                        <p className="text-gray-400">Waiting for video stream...</p>
                                    </div>
                                )}
                                
                                {/* Local Video (PIP) - Only show if local stream has video tracks */}
                                {(localStream && localStream.getVideoTracks && localStream.getVideoTracks().length > 0) && (
                                    <div className="absolute bottom-32 right-6 w-32 h-44 bg-black rounded-xl overflow-hidden border-2 border-gray-700 shadow-xl">
                                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </>
                        ) : (
                            // Voice Call UI
                            <div className="flex flex-col items-center mt-20">
                                <div className={`p-4 rounded-full bg-gray-800 border-4 ${callState === 'connected' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-gray-600'} transition-all duration-500`}>
                                    <img src={remoteUser?.profileImage || defaultProfile} className="w-40 h-40 rounded-full object-cover" />
                                </div>
                                {/* Hidden Audio element for voice calls */}
                                <audio id="remoteAudio" autoPlay playsInline className="hidden" />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-0 w-full p-8 flex justify-center items-center gap-8 bg-gradient-to-t from-black/80 to-transparent">
                        <button onClick={toggleMic} className={`p-4 rounded-full transition ${micMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`} title="Toggle Mute">
                            {micMuted ? <MicOff size={28} /> : <Mic size={28} />}
                        </button>
                        
                        {callState === 'connected' && (
                            <button 
                                onClick={toggleScreenShare} 
                                className={`p-4 rounded-full transition ${isScreenSharing ? 'bg-blue-600 text-white ring-4 ring-blue-400/50' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`}
                                title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
                            >
                                {isScreenSharing ? <MonitorOff size={28} /> : <MonitorUp size={28} />}
                            </button>
                        )}

                        <button onClick={endCall} className="bg-red-500 p-5 rounded-full hover:bg-red-600 transition shadow-lg shadow-red-500/30" title="End Call">
                            <PhoneOff size={32} className="text-white" />
                        </button>

                        {callType === 'video' && (
                            <button onClick={toggleVideo} className={`p-4 rounded-full transition ${videoMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`} title="Toggle Video">
                                {videoMuted ? <CameraOff size={28} /> : <CameraIcon size={28} />}
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CallManager;
