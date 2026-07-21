import React, { useState, useEffect } from 'react';
import { getSocket } from '../socket';
import { X, RotateCcw, Trophy, Swords, Zap } from 'lucide-react';

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

const MiniGameHub = ({ opponent, gameType = 'tictactoe', isHost = true, onClose }) => {
    const socket = getSocket();
    const [activeTab, setActiveTab] = useState(gameType); // 'tictactoe' | 'rps'

    // Tic-Tac-Toe States
    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentTurn, setCurrentTurn] = useState('X'); // X always goes first
    const [winner, setWinner] = useState(null); // 'X' | 'O' | 'Draw' | null
    const [mySymbol] = useState(isHost ? 'X' : 'O');

    // RPS States
    const [myChoice, setMyChoice] = useState(null); // 'rock' | 'paper' | 'scissors'
    const [opponentChoice, setOpponentChoice] = useState(null);
    const [rpsResult, setRpsResult] = useState(null); // 'win' | 'lose' | 'draw' | null

    // -------------------------------------------------------------
    // TIC-TAC-TOE LOGIC
    // -------------------------------------------------------------
    const checkWinner = (currentBoard) => {
        for (let combo of WINNING_COMBOS) {
            const [a, b, c] = combo;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return currentBoard[a];
            }
        }
        if (currentBoard.every(cell => cell !== null)) {
            return 'Draw';
        }
        return null;
    };

    const handleCellClick = (index) => {
        if (board[index] || winner || currentTurn !== mySymbol) return;

        const newBoard = [...board];
        newBoard[index] = mySymbol;
        const nextTurn = mySymbol === 'X' ? 'O' : 'X';
        const gameWin = checkWinner(newBoard);

        setBoard(newBoard);
        setCurrentTurn(nextTurn);
        if (gameWin) setWinner(gameWin);

        if (socket) {
            socket.emit("ticTacToeMove", {
                to: opponent._id,
                index,
                symbol: mySymbol,
                board: newBoard,
                nextTurn,
                winner: gameWin
            });
        }
    };

    const resetTicTacToe = () => {
        const newBoard = Array(9).fill(null);
        setBoard(newBoard);
        setCurrentTurn('X');
        setWinner(null);
        if (socket) {
            socket.emit("ticTacToeMove", {
                to: opponent._id,
                board: newBoard,
                nextTurn: 'X',
                winner: null
            });
        }
    };

    // -------------------------------------------------------------
    // ROCK-PAPER-SCISSORS LOGIC
    // -------------------------------------------------------------
    const determineRPSWinner = (mine, theirs) => {
        if (mine === theirs) return 'draw';
        if (
            (mine === 'rock' && theirs === 'scissors') ||
            (mine === 'paper' && theirs === 'rock') ||
            (mine === 'scissors' && theirs === 'paper')
        ) {
            return 'win';
        }
        return 'lose';
    };

    const handleRPSSelect = (choice) => {
        if (myChoice) return;
        setMyChoice(choice);

        if (socket) {
            socket.emit("rpsChoice", { to: opponent._id, choice });
        }

        if (opponentChoice) {
            const res = determineRPSWinner(choice, opponentChoice);
            setRpsResult(res);
        }
    };

    const resetRPS = () => {
        setMyChoice(null);
        setOpponentChoice(null);
        setRpsResult(null);
    };

    // -------------------------------------------------------------
    // SOCKET LISTENERS
    // -------------------------------------------------------------
    useEffect(() => {
        if (!socket) return;

        const handleTTTMove = ({ board: newBoard, nextTurn, winner: newWinner }) => {
            if (newBoard) setBoard(newBoard);
            if (nextTurn) setCurrentTurn(nextTurn);
            if (newWinner !== undefined) setWinner(newWinner);
        };

        const handleRPSMove = ({ choice }) => {
            setOpponentChoice(choice);
            if (myChoice) {
                const res = determineRPSWinner(myChoice, choice);
                setRpsResult(res);
            }
        };

        socket.on("ticTacToeMove", handleTTTMove);
        socket.on("rpsChoice", handleRPSMove);

        return () => {
            socket.off("ticTacToeMove", handleTTTMove);
            socket.off("rpsChoice", handleRPSMove);
        };
    }, [socket, myChoice]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-white">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600/80 via-orange-600/80 to-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                            <Swords size={22} className="animate-bounce" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base text-white">In-Chat Game Duel</h2>
                            <p className="text-xs text-amber-200/80">Playing vs {opponent?.name || opponent?.userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Game Tabs */}
                <div className="flex bg-slate-950 p-1.5 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('tictactoe')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'tictactoe'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        ❌⭕ Tic-Tac-Toe
                    </button>
                    <button
                        onClick={() => setActiveTab('rps')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'rps'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        ✊✋✌️ Rock Paper Scissors
                    </button>
                </div>

                {/* GAME BODY */}
                <div className="p-6 bg-slate-950/70 flex flex-col items-center justify-center min-h-[340px]">
                    
                    {/* TIC-TAC-TOE TAB */}
                    {activeTab === 'tictactoe' && (
                        <div className="w-full flex flex-col items-center">
                            {/* Turn Status Header */}
                            <div className="mb-4 text-center">
                                {winner ? (
                                    <div className="flex items-center gap-2 text-lg font-extrabold text-amber-400 animate-bounce">
                                        <Trophy size={22} />
                                        {winner === 'Draw' ? "It's a Draw!" : winner === mySymbol ? "🎉 You Won!" : "💀 Opponent Won!"}
                                    </div>
                                ) : (
                                    <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                        {currentTurn === mySymbol ? (
                                            <span className="text-emerald-400 font-bold">Your Turn ({mySymbol})</span>
                                        ) : (
                                            <span className="text-slate-400">Waiting for {opponent?.name || opponent?.userName} ({currentTurn})...</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 3x3 Grid */}
                            <div className="grid grid-cols-3 gap-3 w-64 h-64 bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-inner">
                                {board.map((cell, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleCellClick(idx)}
                                        className={`rounded-xl flex items-center justify-center text-3xl font-extrabold transition-all duration-200 select-none ${
                                            !cell && currentTurn === mySymbol && !winner
                                                ? 'bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/50 cursor-pointer'
                                                : 'bg-slate-900 border border-slate-800 cursor-not-allowed opacity-90'
                                        } ${
                                            cell === 'X' ? 'text-amber-400 shadow-amber-500/20' : 'text-cyan-400 shadow-cyan-500/20'
                                        }`}
                                    >
                                        {cell}
                                    </button>
                                ))}
                            </div>

                            {/* Controls */}
                            <button
                                onClick={resetTicTacToe}
                                className="mt-5 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                <RotateCcw size={14} /> Reset Game
                            </button>
                        </div>
                    )}

                    {/* ROCK-PAPER-SCISSORS TAB */}
                    {activeTab === 'rps' && (
                        <div className="w-full flex flex-col items-center text-center">
                            {/* Outcome Result Header */}
                            {rpsResult ? (
                                <div className="mb-6 flex flex-col items-center gap-1 animate-in zoom-in-75">
                                    <div className={`text-2xl font-black ${
                                        rpsResult === 'win' ? 'text-emerald-400' : rpsResult === 'lose' ? 'text-red-400' : 'text-amber-400'
                                    }`}>
                                        {rpsResult === 'win' ? '🏆 YOU WIN!' : rpsResult === 'lose' ? '💀 YOU LOSE!' : '🤝 DRAW!'}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-4 mt-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
                                        <div>You: <span className="text-lg">{myChoice === 'rock' ? '✊' : myChoice === 'paper' ? '✋' : '✌️'}</span></div>
                                        <div className="font-bold text-slate-600">VS</div>
                                        <div>Them: <span className="text-lg">{opponentChoice === 'rock' ? '✊' : opponentChoice === 'paper' ? '✋' : '✌️'}</span></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <h3 className="font-bold text-base text-slate-200">Pick your weapon:</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {myChoice 
                                            ? "🔒 Choice locked! Waiting for opponent..." 
                                            : "Tap Rock, Paper, or Scissors to duel!"}
                                    </p>
                                </div>
                            )}

                            {/* RPS Choice Buttons */}
                            <div className="flex gap-4 mb-6">
                                {[
                                    { id: 'rock', emoji: '✊', label: 'Rock' },
                                    { id: 'paper', emoji: '✋', label: 'Paper' },
                                    { id: 'scissors', emoji: '✌️', label: 'Scissors' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleRPSSelect(item.id)}
                                        className={`w-20 h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all select-none ${
                                            myChoice === item.id
                                                ? 'bg-amber-500/20 border-amber-500 scale-105 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20'
                                                : myChoice
                                                    ? 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
                                                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 active:scale-95 cursor-pointer'
                                        }`}
                                    >
                                        <span className="text-3xl">{item.emoji}</span>
                                        <span className="text-[11px] font-bold text-slate-300">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {rpsResult && (
                                <button
                                    onClick={resetRPS}
                                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    <RotateCcw size={14} /> Play Again
                                </button>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default MiniGameHub;
