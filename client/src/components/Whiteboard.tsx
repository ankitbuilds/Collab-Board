
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import type { BoardResponse } from "../types/board";
import "./Whiteboard.css";

type Tool = "pen" | "eraser";

export default function Whiteboard() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);

    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#2563eb");
    const [brushSize, setBrushSize] = useState(4);

    const [board, setBoard] = useState<BoardResponse["board"]>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch board details when the room ID changes.
    useEffect(() => {
        if (!roomId) {
            setError("Invalid board room ID");
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadBoard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get<BoardResponse>(
                    `/boards/${encodeURIComponent(roomId)}`
                );

                if (!cancelled) {
                    setBoard(response.data.board);
                }
            } catch {
                if (!cancelled) {
                    setError("Unable to load board. Check your access.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadBoard();

        return () => {
            cancelled = true;
        };
    }, [roomId]);

    const getCanvasPosition = (
        event: ReactPointerEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current!;

        const rect = canvas.getBoundingClientRect();

        return {
            x: (event.clientX - rect.left) *
                (canvas.width / rect.width),
            y: (event.clientY - rect.top) *
                (canvas.height / rect.height),
        };
    };

    const startDrawing = (
        event: ReactPointerEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        isDrawing.current = true;
        canvas.setPointerCapture(event.pointerId);

        const { x, y } = getCanvasPosition(event);

        context.beginPath();
        context.moveTo(x, y);

        context.lineCap = "round";
        context.lineJoin = "round";
        context.globalCompositeOperation =
            tool === "eraser" ? "destination-out" : "source-over";
        context.strokeStyle = color;
        context.lineWidth =
            tool === "eraser" ? brushSize * 4 : brushSize;

        context.lineTo(x + 0.1, y + 0.1);
        context.stroke();
    };

    const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const { x, y } = getCanvasPosition(event);

        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = () => {
        isDrawing.current = false;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    if (loading) {
        return <p>Loading board...</p>;
    }

    if (error || !board) {
        return (
            <main>
                <p role="alert">{error || "Board not found"}</p>
                <button onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </main>
        );
    }

    return (
        <main className="whiteboard-container">
            <header>
                <h1>{board.name}</h1>
                <p>Room ID: {board.roomId}</p>
                <button onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </header>

            <section className="whiteboard-toolbar">
                <button
                    type="button"
                    onClick={() => setTool("pen")}
                    aria-pressed={tool === "pen"}
                >
                    Pen
                </button>

                <button
                    type="button"
                    onClick={() => setTool("eraser")}
                    aria-pressed={tool === "eraser"}
                >
                    Eraser
                </button>

                <label>
                    Color
                    <input
                        type="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                        disabled={tool === "eraser"}
                    />
                </label>

                <label>
                    Brush size: {brushSize}px
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(event) =>
                            setBrushSize(Number(event.target.value))
                        }
                    />
                </label>

                <button type="button" onClick={clearCanvas}>
                    Clear canvas
                </button>
            </section>

            <canvas
                ref={canvasRef}
                width={1200}
                height={700}
                className="whiteboard-canvas"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onLostPointerCapture={stopDrawing}
            />
        </main>
    );
}
