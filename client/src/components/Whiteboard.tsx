import {useRef, useState} from "react";
import { useParams } from "react-router-dom";
import "./Whiteboard.css";

type Tool= "pen" | "eraser";

function Whiteboard(){
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const isDrawing = useRef(false);
    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#2563eb");
    const [brushSize, setBrushSize] = useState(4);

    const { roomId } = useParams<{ roomId: string }>();
    const getCanvasPosition = (
        event: React.PointerEvent<HTMLCanvasElement>

    )=>{
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();

        return{
            x:(event.clientX - rect.left)*(canvas.width/rect.width),
            y:(event.clientY - rect.top)*(canvas.height/rect.height),
        }
    }

    const startDrawing=(
        event: React.PointerEvent<HTMLCanvasElement>
    )=>{
        const canvas = canvasRef.current;
        if(!canvas) return;

        const context = canvas.getContext("2d");
        if(!context) return;

        isDrawing.current = true;
        canvas.setPointerCapture(event.pointerId);

        const {x,y} = getCanvasPosition(event);

        context.beginPath();
        context.moveTo(x,y);

        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = tool ==="eraser" ? "#fffff": color;
        context.lineWidth = tool === "eraser" ? brushSize*4: brushSize;

        context.lineTo(x+0.1, y+0.1);
        context.stroke();
    };

    const draw = (event:React.PointerEvent<HTMLCanvasElement>)=>{
        if(!isDrawing.current) return;

        const canvas = canvasRef.current;
        if(!canvas) return;

        const context = canvas.getContext("2d");
            if(!context) return;
        
        const {x,y} = getCanvasPosition(event);
        context.lineTo(x,y);
        context.stroke();
    };

    const stopDrawing = ()=>{
        isDrawing.current = false;
    };

    const clearCanvas = ()=>{
        const canvas = canvasRef.current;
        if(!canvas) return;

        const context = canvas.getContext("2d");
        if(!context) return;

        context.clearRect(0,0,canvas.width, canvas.height);
    };

    return (
        <div>
            <div>
                <button type="button"
                onClick={()=>setTool("pen")}
                aria-pressed={tool==="pen"}>Pen</button>

                <button type="button"
                onClick={()=>setTool("eraser")}
                aria-pressed={tool==="eraser"}>
                    Eraser
                </button>

                <label>
                    Color
                    <input
                    type="color"
                    value={color}
                    onChange={(event)=>setColor(event.target.value)}
                    disabled={tool==="eraser"}/>
                </label>

                <label>
                    Brush size: {brushSize}px
                    <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(event)=>setBrushSize(Number(event.target.value))}/>
                </label>

                <button type="button" onClick={clearCanvas}>Clear canvas</button>
            </div>

            <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            className="whiteboard-canvas"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onLostPointerCapture={stopDrawing}/>
        </div>
    )
}

export default Whiteboard;