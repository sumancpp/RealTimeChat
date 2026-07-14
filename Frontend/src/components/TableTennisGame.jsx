import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

const TableTennisGame = ({ opponent, isHost, activeGameMessageId, onEndGame }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState({ me: 0, opponent: 0 });
    const { userData } = useSelector((state) => state.user);

    // Game constants
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 400;
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 80;
    const BALL_SIZE = 10;
    
    const gameState = useRef({
        myPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        opponentPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 5, dy: 5 },
        isHost: isHost,
        isPaused: true // Start with a brief pause
    });

    useEffect(() => {
        // Initial pause before game starts
        const timer = setTimeout(() => {
            if (gameState.current) gameState.current.isPaused = false;
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("paddleMove", ({ y }) => {
            gameState.current.opponentPaddleY = y;
        });

        socket.on("ballMove", ({ ball }) => {
            if (!gameState.current.isHost) {
                gameState.current.ball = ball;
            }
        });

        socket.on("scoreUpdate", ({ score: newScore }) => {
            if (!gameState.current.isHost) {
                // If I am guest, the host's score is my opponent's score, host's opponent score is my score
                setScore({ me: newScore.opponent, opponent: newScore.me });
            }
        });
        
        socket.on("gameEnded", () => {
            onEndGame();
        });

        return () => {
            socket.off("paddleMove");
            socket.off("ballMove");
            socket.off("scoreUpdate");
            socket.off("gameEnded");
        };
    }, []);

    // Handle mouse movement for paddle
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            // Scale mouse coordinates to match internal canvas resolution
            const scaleY = canvas.height / rect.height;
            let y = (e.clientY - rect.top) * scaleY - PADDLE_HEIGHT / 2;
            
            if (y < 0) y = 0;
            if (y > CANVAS_HEIGHT - PADDLE_HEIGHT) y = CANVAS_HEIGHT - PADDLE_HEIGHT;
            
            gameState.current.myPaddleY = y;
            socket.emit("paddleMove", { to: opponent._id, y });
        };

        const handleTouchMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleY = canvas.height / rect.height;
            let y = (e.touches[0].clientY - rect.top) * scaleY - PADDLE_HEIGHT / 2;
            if (y < 0) y = 0;
            if (y > CANVAS_HEIGHT - PADDLE_HEIGHT) y = CANVAS_HEIGHT - PADDLE_HEIGHT;
            
            gameState.current.myPaddleY = y;
            socket.emit("paddleMove", { to: opponent._id, y });
            e.preventDefault();
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("touchmove", handleTouchMove);
        };
    }, [opponent._id]);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const render = () => {
            // Clear canvas
            ctx.fillStyle = '#0b2a5b';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw center line
            ctx.strokeStyle = '#fff';
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(CANVAS_WIDTH / 2, 0);
            ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw paddles
            ctx.fillStyle = '#f97316'; // Orange for my paddle
            if (gameState.current.isHost) {
                ctx.fillRect(10, gameState.current.myPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
                ctx.fillStyle = '#fff'; // White for opponent paddle
                ctx.fillRect(CANVAS_WIDTH - 20, gameState.current.opponentPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
            } else {
                ctx.fillRect(CANVAS_WIDTH - 20, gameState.current.myPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
                ctx.fillStyle = '#fff';
                ctx.fillRect(10, gameState.current.opponentPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
            }

            // Draw ball
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.arc(gameState.current.ball.x, gameState.current.ball.y, BALL_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            if (gameState.current.isPaused) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = 'bold 40px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Get Ready...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
            }

            // Host handles physics
            if (gameState.current.isHost) {
                if (!gameState.current.isPaused) {
                    let { x, y, dx, dy } = gameState.current.ball;
                    
                    x += dx;
                    y += dy;

                    // Bounce off top and bottom
                    if (y - BALL_SIZE < 0 || y + BALL_SIZE > CANVAS_HEIGHT) {
                        dy *= -1;
                    }

                    // Bounce off paddles
                    let paddleX = dx < 0 ? 10 + PADDLE_WIDTH : CANVAS_WIDTH - 20 - BALL_SIZE;
                    let paddleY = dx < 0 ? gameState.current.myPaddleY : gameState.current.opponentPaddleY;

                    if (
                        (dx < 0 && x - BALL_SIZE < paddleX && y > paddleY && y < paddleY + PADDLE_HEIGHT) ||
                        (dx > 0 && x + BALL_SIZE > paddleX && y > paddleY && y < paddleY + PADDLE_HEIGHT)
                    ) {
                        dx *= -1.1; // Speed up slightly
                        dy = (y - (paddleY + PADDLE_HEIGHT / 2)) * 0.2; // Add some english
                    }

                    // Scoring
                    if (x < 0) {
                        // Opponent scores
                        setScore(s => {
                            const newScore = { ...s, opponent: s.opponent + 1 };
                            socket.emit("scoreUpdate", { to: opponent._id, score: newScore });
                            return newScore;
                        });
                        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 5, dy: 5 };
                        socket.emit("ballMove", { to: opponent._id, ball: gameState.current.ball });
                        
                        gameState.current.isPaused = true;
                        setTimeout(() => {
                            if (gameState.current) gameState.current.isPaused = false;
                        }, 2000);
                    } else if (x > CANVAS_WIDTH) {
                        // I score
                        setScore(s => {
                            const newScore = { ...s, me: s.me + 1 };
                            socket.emit("scoreUpdate", { to: opponent._id, score: newScore });
                            return newScore;
                        });
                        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: -5, dy: 5 };
                        socket.emit("ballMove", { to: opponent._id, ball: gameState.current.ball });
                        
                        gameState.current.isPaused = true;
                        setTimeout(() => {
                            if (gameState.current) gameState.current.isPaused = false;
                        }, 2000);
                    } else {
                        gameState.current.ball = { x, y, dx, dy };
                        socket.emit("ballMove", { to: opponent._id, ball: gameState.current.ball });
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [opponent._id]);
    
    const handleEndGame = () => {
        socket.emit("endGame", { to: opponent._id, messageId: activeGameMessageId });
        onEndGame();
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#051630] p-4 sm:p-8 backdrop-blur-md">
            <button 
                onClick={handleEndGame} 
                className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-white/10 p-3 rounded-full shadow-lg text-white hover:bg-red-500 hover:text-white transition-all backdrop-blur-sm z-50"
            >
                <X size={28} />
            </button>
            <div className="flex justify-between w-full max-w-[1200px] mb-6 px-6 font-extrabold text-3xl sm:text-5xl text-white tracking-wider">
                <div className="flex items-center gap-4 bg-white/10 px-6 py-3 rounded-2xl shadow-inner border border-white/5">
                    <span className="text-xl sm:text-2xl text-gray-300 font-medium">{isHost ? "You" : (opponent.name || opponent.userName)}</span>
                    <span className="text-orange-500 min-w-[2ch] text-center">{isHost ? score.me : score.opponent}</span>
                </div>
                <div className="flex items-center gap-4 bg-white/10 px-6 py-3 rounded-2xl shadow-inner border border-white/5">
                    <span className="text-orange-500 min-w-[2ch] text-center">{!isHost ? score.me : score.opponent}</span>
                    <span className="text-xl sm:text-2xl text-gray-300 font-medium">{!isHost ? "You" : (opponent.name || opponent.userName)}</span>
                </div>
            </div>
            <div className="w-full max-w-[1200px] flex-1 max-h-[75vh] bg-[#0b2a5b] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.15)] border-4 border-orange-500/50 relative flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="w-full h-full object-contain cursor-none"
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                />
            </div>
            <p className="mt-8 text-gray-400 font-medium text-sm sm:text-base tracking-wide uppercase">Move your mouse or finger up and down to control the paddle</p>
        </div>
    );
};

export default TableTennisGame;
