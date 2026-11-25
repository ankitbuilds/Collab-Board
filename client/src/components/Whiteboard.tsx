
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import type { BoardResponse } from "../types/board";
import "./Whiteboard.css";
import axios from "axios";

type Tool = "pen" | "eraser";
type Point = {
    x: number;
    y: number;
};
type StrokeData = {
    points: Point[];
    color: string;
    brushSize: number;
    tool: "pen" | "eraser";
}
type SavedElement = {
    id: String;
    type: "line";
    data: StrokeData;
    createdBy: string;

}

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

    const [elements, setElements] = useState<SavedElement[]>([]);

    const currentStroke = useRef<StrokeData | null>(null);

    useEffect(() => {
        if (!board?.roomId) return;

        let cancelled = false;

        const loadElements = async () => {
            try {
                const response = await api.get<{
                    elements: SavedElement[];
                }>(`/boards/${encodeURIComponent(board.roomId)}/elements`);

                if (!cancelled) {
                    setElements(response.data.elements);
                }
            } catch (error) {
                if (!cancelled) {
                    setError("Unable to load saved drawings.");
                }
                console.error("Load drawings error:", error);
            }
        };

        void loadElements();

        return () => {
            cancelled = true;
        };
    }, [board?.roomId]);




    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        elements.forEach((element) => {
            const { points, color, brushSize, tool } = element.data;

            if (!points || points.length === 0) return;

            context.beginPath();
            context.lineCap = "round";
            context.lineJoin = "round";

            context.strokeStyle = color;
            context.lineWidth =
                tool === "eraser" ? brushSize * 4 : brushSize;

            context.globalCompositeOperation =
                tool === "eraser" ? "destination-out" : "source-over";

            context.moveTo(points[0].x, points[0].y);

            points.slice(1).forEach((point) => {
                context.lineTo(point.x, point.y);
            });

            if (points.length === 1) {
                context.lineTo(
                    points[0].x + 0.1,
                    points[0].y + 0.1
                );
            }

            context.stroke();
        });

        context.globalCompositeOperation = "source-over";
    }, [elements]);

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

        currentStroke.current = {
            points: [{ x, y }],
            color,
            brushSize,
            tool,
        };

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
        if (!isDrawing.current || !currentStroke.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const { x, y } = getCanvasPosition(event);

        currentStroke.current.points.push({ x, y });

        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = async () => {
        if (!isDrawing.current) return;

        isDrawing.current = false;

        const stroke = currentStroke.current;
        currentStroke.current = null;

        if (!stroke || !board?.roomId) return;

        try {
            const response = await api.post<{
                element: SavedElement;
            }>(
                `/boards/${encodeURIComponent(board.roomId)}/elements`,
                {
                    type: "line",
                    data: stroke,
                }
            );

            setElements((previous) => [
                ...previous,
                response.data.element,
            ]);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Save drawing failed:", {
                    status: error.response?.status,
                    response: error.response?.data,
                });

                setError(
                    error.response?.data?.message ||
                    "Drawing could not be saved."
                );
            } else {
                console.error("Unexpected drawing error:", error);
                setError("Something went wrong while saving.");
            }
        }
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
                onLostPointerCapture={() => {
                    isDrawing.current = false;
                }}
            />
        </main>
    );
}
