import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, PhoneOff, Mic, MicOff, Camera as CameraIcon, CameraOff } from 'lucide-react';
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

    // Refs
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

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
                } else if (signalData.type === 'answer') {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
                } else if (signalData.candidate) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signalData));
                }
            } catch (err) {
                console.log("WebRTC Signal Error", err);
            }
        });

        socket.on("callEnded", () => {
            endCallLocally();
        });

        return () => {
            window.removeEventListener('startCall', handleStartCall);
            socket.off("incomingCall");
            socket.off("callRejected");
            socket.off("callAccepted");
            socket.off("webrtcSignal");
            socket.off("callEnded");
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
        }
    }, [remoteStream, callState]);

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
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Add local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current);
            });
        }

        // Listen for remote stream
        peerConnection.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
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
        await startLocalMedia(callType);
        setCallState('connected');
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
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            localStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setMicMuted(false);
        setVideoMuted(false);
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
                    initial={{ y: -100, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-2xl p-5 shadow-2xl z-[999] flex flex-col items-center min-w-[300px] border border-gray-700"
                >
                    <img src={remoteUser?.profileImage || defaultProfile} className="w-20 h-20 rounded-full mb-3 border-2 border-green-500 animate-pulse" />
                    <h3 className="text-xl font-bold">{remoteUser?.name || remoteUser?.userName}</h3>
                    <p className="text-gray-400 mb-6">{callType === 'video' ? 'Incoming Video Call...' : 'Incoming Voice Call...'}</p>
                    <div className="flex gap-6 w-full justify-center">
                        <button onClick={rejectCall} className="bg-red-500 p-4 rounded-full hover:bg-red-600 transition">
                            <PhoneOff size={24} />
                        </button>
                        <button onClick={answerCall} className="bg-green-500 p-4 rounded-full hover:bg-green-600 transition animate-bounce">
                            {callType === 'video' ? <Video size={24} /> : <Phone size={24} />}
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
                    </div>

                    {/* Video / Audio Area */}
                    <div className="flex-1 relative flex items-center justify-center">
                        {callType === 'video' ? (
                            <>
                                {/* Remote Video */}
                                {remoteStream ? (
                                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <img src={remoteUser?.profileImage || defaultProfile} className="w-32 h-32 rounded-full mb-4 opacity-50" />
                                        <p className="text-gray-400">Waiting for video...</p>
                                    </div>
                                )}
                                
                                {/* Local Video (PIP) */}
                                <div className="absolute bottom-32 right-6 w-32 h-44 bg-black rounded-xl overflow-hidden border-2 border-gray-700 shadow-xl">
                                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                </div>
                            </>
                        ) : (
                            // Voice Call UI
                            <div className="flex flex-col items-center mt-20">
                                <div className={`p-4 rounded-full bg-gray-800 border-4 ${callState === 'connected' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-gray-600'} transition-all duration-500`}>
                                    <img src={remoteUser?.profileImage || defaultProfile} className="w-40 h-40 rounded-full object-cover" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-0 w-full p-8 flex justify-center items-center gap-8 bg-gradient-to-t from-black/80 to-transparent">
                        <button onClick={toggleMic} className={`p-4 rounded-full transition ${micMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`}>
                            {micMuted ? <MicOff size={28} /> : <Mic size={28} />}
                        </button>
                        
                        <button onClick={endCall} className="bg-red-500 p-5 rounded-full hover:bg-red-600 transition shadow-lg shadow-red-500/30">
                            <PhoneOff size={32} className="text-white" />
                        </button>

                        {callType === 'video' && (
                            <button onClick={toggleVideo} className={`p-4 rounded-full transition ${videoMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`}>
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
