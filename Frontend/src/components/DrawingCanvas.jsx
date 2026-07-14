import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { socket, getSocket } from '../socket';

const DrawingCanvas = ({ groupId, onClose }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    
    // Set up canvas context
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Handle resizing for better resolution
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const activeSocket = getSocket() || socket;

        const handleDraw = ({ groupId: incomingGroupId, data }) => {
            if (incomingGroupId === groupId) {
                drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
            }
        };

        const handleClear = ({ groupId: incomingGroupId }) => {
            if (incomingGroupId === groupId) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        };

        activeSocket.on('draw', handleDraw);
        activeSocket.on('clearCanvas', handleClear);

        return () => {
            activeSocket.off('draw', handleDraw);
            activeSocket.off('clearCanvas', handleClear);
        };
    }, [groupId]);

    const drawLine = (x0, y0, x1, y1, strokeColor, emit) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();

        if (!emit) return;
        
        const activeSocket = getSocket() || socket;
        activeSocket.emit('draw', {
            groupId,
            data: { x0, y0, x1, y1, color: strokeColor }
        });
    };

    const posRef = useRef({ x: 0, y: 0 });

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        const { x, y } = getMousePos(e);
        posRef.current = { x, y };
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        
        const { x, y } = getMousePos(e);
        drawLine(posRef.current.x, posRef.current.y, x, y, color, true);
        posRef.current = { x, y };
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const activeSocket = getSocket() || socket;
        activeSocket.emit('clearCanvas', { groupId });
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-t-2xl w-full max-w-3xl flex justify-between items-center p-4 shadow-lg border-b">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-800">Group Whiteboard</h3>
                    <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        title="Choose Color"
                    />
                    <button 
                        onClick={clearCanvas}
                        className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
                    >
                        <Trash2 size={16} /> Clear
                    </button>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-full transition"
                >
                    <X size={24} />
                </button>
            </div>
            
            <div className="w-full max-w-3xl h-[60vh] bg-white rounded-b-2xl shadow-xl overflow-hidden relative touch-none cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
                    className="absolute inset-0 w-full h-full"
                />
            </div>
            <p className="text-white/70 text-sm mt-4 font-medium tracking-wide">
                Draw together in real-time with everyone in the group!
            </p>
        </div>
    );
};

export default DrawingCanvas;
