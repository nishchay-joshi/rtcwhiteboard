import { useRef, useEffect } from "react";
import "./whiteboard.css";

type Point = {
    x: number;
    y: number;
};

function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const currentStroke = useRef<Point[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.scale(dpr, dpr);

            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        };

        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>): Point | null {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    function drawStroke(points: Point[]) {
        const canvas = canvasRef.current;
        if (!canvas || points.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();

    }

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
        const point = getCanvasPoint(event);
        if (!point) return;

        isDrawing.current = true;
        currentStroke.current = [point];
    }

    function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
        if (!isDrawing.current) return;

        const point = getCanvasPoint(event);
        if (!point) return;

        currentStroke.current.push(point);
        drawStroke(currentStroke.current);
    }

    function handlePointerUp() {
        isDrawing.current = false;
    }

    return (
        <div className="whiteboard-container">
            <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            />
        </div>
    );
}

export default Whiteboard;