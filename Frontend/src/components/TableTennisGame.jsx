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
        isPaused: true, // Start with a brief pause
        lastPaddleEmit: 0,
        lastEmittedX: -1,
        lastFrameTime: performance.now()
    });

    useEffect(() => {
        // Initial pause before game starts
        const timer = setTimeout(() => {
            if (gameState.current) {
                gameState.current.isPaused = false;
                gameState.current.lastFrameTime = performance.now();
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("paddleMove", ({ x }) => {
            gameState.current.opponentPaddleX = x;
        });

        socket.on("ballMove", ({ ball }) => {
            const isCenterReset = ball.x === CANVAS_WIDTH / 2 && ball.y === CANVAS_HEIGHT / 2;
            
            if (gameState.current.isPaused || isCenterReset) {
                gameState.current.ball = ball;
                return;
            }

            // Distributed Authority Lag Compensation
            const localDyDirection = gameState.current.ball.dy > 0 ? 1 : -1;
            const networkDyDirection = ball.dy > 0 ? 1 : -1;

            if (localDyDirection !== networkDyDirection) {
                // We missed the prediction (or it hasn't happened yet locally). Accept authoritative state.
                gameState.current.ball = ball;
            } else {
                // We successfully predicted the bounce!
                // To prevent the Y-axis stutter (which looks like the ball goes back into the paddle),
                // we keep our smooth local Y coordinate, and extrapolate the authoritative X coordinate.
                let yDistance = gameState.current.ball.y - ball.y;
                let steps = yDistance / ball.dy; 
                
                if (steps > 0 && steps < 150) { 
                    let extrapolatedX = ball.x + (ball.dx * steps);
                    let newDx = ball.dx;
                    
                    // Handle wall bounces during the extrapolated time
                    if (extrapolatedX < BALL_SIZE) {
                        extrapolatedX = BALL_SIZE + (BALL_SIZE - extrapolatedX);
                        newDx *= -1; 
                    } else if (extrapolatedX > CANVAS_WIDTH - BALL_SIZE) {
                        extrapolatedX = (CANVAS_WIDTH - BALL_SIZE) - (extrapolatedX - (CANVAS_WIDTH - BALL_SIZE));
                        newDx *= -1;
                    }

                    gameState.current.ball = {
                        x: extrapolatedX,
                        y: gameState.current.ball.y, // Maintain perfect Y smoothness
                        dx: newDx,
                        dy: ball.dy
                    };
                } else {
                    gameState.current.ball = ball;
                }
            }
        });

        socket.on("scoreUpdate", ({ score: newScore }) => {
            // Both clients accept score updates from the opponent
            setScore({ me: newScore.opponent, opponent: newScore.me });
            gameState.current.isPaused = true;
            setTimeout(() => {
                if (gameState.current) {
                    gameState.current.isPaused = false;
                    gameState.current.lastFrameTime = performance.now();
                }
            }, 2000);
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
            
            const now = Date.now();
            // Throttle to max ~30fps for paddle emits to save bandwidth on slow internet
            if (now - gameState.current.lastPaddleEmit > 30 || Math.abs(gameState.current.lastEmittedX - x) > 20) {
                gameState.current.lastPaddleEmit = now;
                gameState.current.lastEmittedX = x;
                socket.emit("paddleMove", { to: opponent._id, x });
            }
        };

        const handleMouseMove = (e) => {
            updatePaddlePosition(e.clientX);
        };

        const handleTouchMove = (e) => {
            updatePaddlePosition(e.touches[0].clientX);
            e.preventDefault();
        };

        const handleTouchStart = (e) => {
            updatePaddlePosition(e.touches[0].clientX);
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
        canvas.addEventListener("touchstart", handleTouchStart, { passive: true });

        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("touchmove", handleTouchMove);
            canvas.removeEventListener("touchstart", handleTouchStart);
        };
    }, [opponent._id]);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        gameState.current.lastFrameTime = performance.now();

        const render = (time) => {
            const dt = time - (gameState.current.lastFrameTime || time);
            gameState.current.lastFrameTime = time;
            
            // Limit dt to prevent massive jumps if tab was inactive
            const safeDt = Math.min(dt, 50); 
            // 60 FPS is 16.66ms per frame. Multiplier is 1 at 60 FPS.
            const timeScale = safeDt / 16.666;

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

            // Both clients handle ball movement to prevent lag over network
            if (!gameState.current.isPaused) {
                let { x, y, dx, dy } = gameState.current.ball;
                
                x += dx * timeScale;
                y += dy * timeScale;

                // Bounce off left and right walls
                if (x - BALL_SIZE < 0 || x + BALL_SIZE > CANVAS_WIDTH) {
                    dx *= -1;
                    if (x - BALL_SIZE < 0) x = BALL_SIZE;
                    if (x + BALL_SIZE > CANVAS_WIDTH) x = CANVAS_WIDTH - BALL_SIZE;
                }

                // Bounce off paddles
                const HIT_LENIENCY = 45; // Increased leniency for lag
                
                let topPaddleX = gameState.current.isHost ? gameState.current.opponentPaddleX : gameState.current.myPaddleX;
                let bottomPaddleX = gameState.current.isHost ? gameState.current.myPaddleX : gameState.current.opponentPaddleX;

                let hitTop = dy < 0 && 
                             y - BALL_SIZE <= 20 && 
                             y + BALL_SIZE >= 10 && 
                             x + BALL_SIZE >= topPaddleX - HIT_LENIENCY && 
                             x - BALL_SIZE <= topPaddleX + PADDLE_WIDTH + HIT_LENIENCY;

                let hitBottom = dy > 0 && 
                                y + BALL_SIZE >= CANVAS_HEIGHT - 20 && 
                                y - BALL_SIZE <= CANVAS_HEIGHT - 10 && 
                                x + BALL_SIZE >= bottomPaddleX - HIT_LENIENCY && 
                                x - BALL_SIZE <= bottomPaddleX + PADDLE_WIDTH + HIT_LENIENCY;

                if (hitTop || hitBottom) {
                    let newSpeed = Math.abs(dy) * 1.05;
                    const MAX_SPEED = 12;
                    if (newSpeed > MAX_SPEED) newSpeed = MAX_SPEED;
                    
                    dy = dy > 0 ? -newSpeed : newSpeed;
                    
                    let paddleCenter = hitTop ? topPaddleX + PADDLE_WIDTH / 2 : bottomPaddleX + PADDLE_WIDTH / 2;
                    dx = (x - paddleCenter) * 0.15;
                    
                    if (hitTop) y = 20 + BALL_SIZE;
                    if (hitBottom) y = CANVAS_HEIGHT - 20 - BALL_SIZE;

                    gameState.current.ball = { x, y, dx, dy };
                    
                    // DISTRIBUTED AUTHORITY: If I hit my own paddle, I am the boss of this bounce.
                    // I will emit the authoritative ball state to my opponent to correct them if they missed it.
                    let hitMyPaddle = (gameState.current.isHost && hitBottom) || (!gameState.current.isHost && hitTop);
                    if (hitMyPaddle) {
                        socket.emit("ballMove", { to: opponent._id, ball: gameState.current.ball });
                    }
                } else {
                    gameState.current.ball = { x, y, dx, dy };
                }
            }

            // Distributed Scoring (Each player is authoritative over their own misses)
            if (!gameState.current.isPaused) {
                let { y } = gameState.current.ball;
                
                if (gameState.current.isHost) {
                    // Host is responsible for the bottom wall (their own side)
                    if (y > CANVAS_HEIGHT) {
                        // Host missed! Guest scored
                        setScore(s => {
                            const newScore = { ...s, opponent: s.opponent + 1 };
                            socket.emit("scoreUpdate", { to: opponent._id, score: newScore });
                            return newScore;
                        });
                        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: -5, dy: -5 };
                        socket.emit("ballMove", { to: opponent._id, ball: gameState.current.ball });
                        
                        gameState.current.isPaused = true;
                        setTimeout(() => {
                            if (gameState.current) {
                                gameState.current.isPaused = false;
                                gameState.current.lastFrameTime = performance.now();
                            }
                        }, 2000);
                    }
                } else {
                    // Guest is responsible for the top wall (their own side)
                    if (y < 0) {
                        // Guest missed! Host scored
                        setScore(s => {
                            const newScore = { ...s, opponent: s.opponent + 1 }; // From Guest's perspective, opponent (Host) scored
                            socket.emit("scoreUpdate", { to: opponent._id, score: newScore });
                            return newScore;
                        });
                        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 5, dy: 5 };
                        socket.emit("ballMove", { to: opponent._id, ball: gameState.current.ball });
                        
                        gameState.current.isPaused = true;
                        setTimeout(() => {
                            if (gameState.current) {
                                gameState.current.isPaused = false;
                                gameState.current.lastFrameTime = performance.now();
                            }
                        }, 2000);
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

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
