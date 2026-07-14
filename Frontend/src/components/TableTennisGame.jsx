import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

const TableTennisGame = ({ opponent, isHost, activeGameMessageId, onEndGame }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState({ me: 0, opponent: 0 });
    const { userData } = useSelector((state) => state.user);

    // Game constants
    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 600;
    const PADDLE_WIDTH = 80;
    const PADDLE_HEIGHT = 10;
    const BALL_SIZE = 10;
    
    const gameState = useRef({
        myPaddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        opponentPaddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
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

        socket.on("paddleMove", ({ x }) => {
            gameState.current.opponentPaddleX = x;
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

    // Handle touch/mouse movement for paddle
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const updatePaddlePosition = (clientX) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            let touchX = (clientX - rect.left) * scaleX;
            
            // If I am guest, my view is flipped 180 degrees.
            // A touch on the left screen (small clientX) maps to the right of the canvas (large X).
            if (!gameState.current.isHost) {
                touchX = CANVAS_WIDTH - touchX;
            }
            
            let x = touchX - PADDLE_WIDTH / 2;
            
            if (x < 0) x = 0;
            if (x > CANVAS_WIDTH - PADDLE_WIDTH) x = CANVAS_WIDTH - PADDLE_WIDTH;
            
            gameState.current.myPaddleX = x;
            socket.emit("paddleMove", { to: opponent._id, x });
        };

        const handleMouseMove = (e) => {
            updatePaddlePosition(e.clientX);
        };

        const handleTouchMove = (e) => {
            updatePaddlePosition(e.touches[0].clientX);
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
            ctx.moveTo(0, CANVAS_HEIGHT / 2);
            ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // If Guest, rotate canvas 180 degrees so their paddle is at the bottom
            if (!gameState.current.isHost) {
                ctx.save();
                ctx.translate(CANVAS_WIDTH, CANVAS_HEIGHT);
                ctx.rotate(Math.PI);
            }

            // Draw Host paddle (at bottom of canvas coordinate system)
            ctx.fillStyle = gameState.current.isHost ? '#f97316' : '#fff';
            ctx.fillRect(gameState.current.isHost ? gameState.current.myPaddleX : gameState.current.opponentPaddleX, CANVAS_HEIGHT - 20, PADDLE_WIDTH, PADDLE_HEIGHT);
            
            // Draw Guest paddle (at top of canvas coordinate system)
            ctx.fillStyle = !gameState.current.isHost ? '#f97316' : '#fff';
            ctx.fillRect(!gameState.current.isHost ? gameState.current.myPaddleX : gameState.current.opponentPaddleX, 10, PADDLE_WIDTH, PADDLE_HEIGHT);

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
                // Because of rotation, Guest text would be upside down. Restore first to draw text right-side up.
                if (!gameState.current.isHost) {
                    ctx.restore();
                }
                ctx.fillText('Get Ready...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
                // Re-save and rotate just in case anything else draws after this (though there isn't)
                if (!gameState.current.isHost) {
                    ctx.save();
                    ctx.translate(CANVAS_WIDTH, CANVAS_HEIGHT);
                    ctx.rotate(Math.PI);
                }
            }

            if (!gameState.current.isHost) {
                ctx.restore();
            }

            // Host handles physics
            if (gameState.current.isHost) {
                if (!gameState.current.isPaused) {
                    let { x, y, dx, dy } = gameState.current.ball;
                    
                    x += dx;
                    y += dy;

                    // Bounce off left and right walls
                    if (x - BALL_SIZE < 0 || x + BALL_SIZE > CANVAS_WIDTH) {
                        dx *= -1;
                    }

                    // Bounce off paddles
                    const HIT_LENIENCY = 25; // Compensates for network latency
                    
                    let hitGuest = dy < 0 && 
                                   y - BALL_SIZE <= 20 && 
                                   y + BALL_SIZE >= 10 && 
                                   x + BALL_SIZE >= gameState.current.opponentPaddleX - HIT_LENIENCY && 
                                   x - BALL_SIZE <= gameState.current.opponentPaddleX + PADDLE_WIDTH + HIT_LENIENCY;

                    let hitHost = dy > 0 && 
                                  y + BALL_SIZE >= CANVAS_HEIGHT - 20 && 
                                  y - BALL_SIZE <= CANVAS_HEIGHT - 10 && 
                                  x + BALL_SIZE >= gameState.current.myPaddleX - HIT_LENIENCY && 
                                  x - BALL_SIZE <= gameState.current.myPaddleX + PADDLE_WIDTH + HIT_LENIENCY;

                    if (hitGuest || hitHost) {
                        // Increase speed gradually by 5% and cap it at a maximum of 12
                        let newSpeed = Math.abs(dy) * 1.05;
                        const MAX_SPEED = 12;
                        if (newSpeed > MAX_SPEED) newSpeed = MAX_SPEED;
                        
                        // Reverse direction with the new speed
                        dy = dy > 0 ? -newSpeed : newSpeed;
                        
                        let paddleCenter = hitGuest ? gameState.current.opponentPaddleX + PADDLE_WIDTH / 2 : gameState.current.myPaddleX + PADDLE_WIDTH / 2;
                        dx = (x - paddleCenter) * 0.15; // Add some english (reduced multiplier for better control)
                    }

                    // Scoring
                    if (y < 0) {
                        // Host scored (ball passed Guest at top)
                        setScore(s => {
                            const newScore = { ...s, me: s.me + 1 };
                            socket.emit("scoreUpdate", { to: opponent._id, score: newScore });
                            return newScore;
                        });
                        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 5, dy: 5 };
                        socket.emit("ballMove", { to: opponent._id, ball: gameState.current.ball });
                        
                        gameState.current.isPaused = true;
                        setTimeout(() => {
                            if (gameState.current) gameState.current.isPaused = false;
                        }, 2000);
                    } else if (y > CANVAS_HEIGHT) {
                        // Guest scored (ball passed Host at bottom)
                        setScore(s => {
                            const newScore = { ...s, opponent: s.opponent + 1 };
                            socket.emit("scoreUpdate", { to: opponent._id, score: newScore });
                            return newScore;
                        });
                        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: -5, dy: -5 };
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
            <p className="mt-8 text-gray-400 font-medium text-sm sm:text-base tracking-wide uppercase">Move your mouse or finger left and right to control the paddle</p>
        </div>
    );
};

export default TableTennisGame;
