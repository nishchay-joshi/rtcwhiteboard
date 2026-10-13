import { useRef, useEffect } from "react";
import "./whiteboard.css";
import type { Point, Stroke, Rectangle, WhiteboardObject } from "../types/whiteboard";


function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const currentStroke = useRef<Stroke | null>(null);
    const objects = useRef<WhiteboardObject[]>([]);
    const currentRectangle = useRef<Rectangle | null>(null);
    const rectangleStart = useRef<Point | null>(null);
    const activeTool = useRef<"select" | "stroke" | "rectangle">("select");
    const selectedObjectId = useRef<string | null>(null);

    function renderObjects() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();

        ctx.clearRect(0, 0, rect.width, rect.height);

        for (const object of objects.current) {
            if (object.type === "stroke") {
                ctx.strokeStyle = object.color;
                ctx.lineWidth = object.width;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                drawStroke(object.points);
            }

            if (object.type === "rectangle") {
                drawRectangle(object);
            }
        }

        const selectedObject = objects.current.find(
            object => object.id === selectedObjectId.current
        );

        if (selectedObject) {
            drawSelectionBox(selectedObject);
        }
    }

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

        renderObjects();
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

    function drawRectangle(rectangle: Rectangle) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.strokeStyle = rectangle.color;
        ctx.lineWidth = rectangle.lineWidth;

        ctx.strokeRect(
            rectangle.x,
            rectangle.y,
            rectangle.width,
            rectangle.height
        );
    }

    function drawSelectionBox(object: WhiteboardObject) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (object.type === "rectangle") {
            ctx.save();

            ctx.strokeStyle = "blue";
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);

            ctx.strokeRect(
                object.x - 4,
                object.y - 4,
                object.width + 8,
                object.height + 8
            );

            ctx.restore();
        }
    }

    function findObjectAtPoint(point: Point): WhiteboardObject | null {
        for (let i = objects.current.length - 1; i >= 0; i--) {
            const object = objects.current[i];

            if (object.type === "rectangle") {
                const inside =
                    point.x >= object.x &&
                    point.x <= object.x + object.width &&
                    point.y >= object.y &&
                    point.y <= object.y + object.height;

                if (inside) {
                    return object;
                }
            }
        }

        return null;
    }

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
        const point = getCanvasPoint(event);
        if (!point) return;

        if (activeTool.current === "select") {
            const object = findObjectAtPoint(point);
            selectedObjectId.current = object?.id ?? null;

            renderObjects();
            return;
        }

        isDrawing.current = true;

        if (activeTool.current === "stroke") {
            currentStroke.current = {
                id: crypto.randomUUID(),
                type: "stroke",
                points: [point],
                color: "black",
                width: 2,
            };
        }

        if (activeTool.current === "rectangle") {
            rectangleStart.current = point;

            currentRectangle.current = {
                id: crypto.randomUUID(),
                type: "rectangle",
                x: point.x,
                y: point.y,
                width: 0,
                height: 0,
                color: "black",
                lineWidth: 2,
            };
        }
    }

    function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
        if (!isDrawing.current) return;

        const point = getCanvasPoint(event);
        if (!point) return;

        if (activeTool.current === "stroke") {
            if (!currentStroke.current) return;

            currentStroke.current.points.push(point);
            drawStroke(currentStroke.current.points);
        }

        if (activeTool.current === "rectangle") {
            if (!currentRectangle.current || !rectangleStart.current) return;

            currentRectangle.current.x = Math.min(
                rectangleStart.current.x, point.x);
            currentRectangle.current.y = Math.min(
                rectangleStart.current.y, point.y);
            currentRectangle.current.width = Math.abs(
                point.x - rectangleStart.current.x);
            currentRectangle.current.height = Math.abs(
                point.y - rectangleStart.current.y);

            renderObjects();
            drawRectangle(currentRectangle.current);
        }
    }

    function handlePointerUp() {
        isDrawing.current = false;

        if (activeTool.current === "stroke") {
            if (currentStroke.current) {
                objects.current.push(currentStroke.current);
                currentStroke.current = null;
            }
        }

        if (activeTool.current === "rectangle") {
            if (currentRectangle.current) {
                objects.current.push(currentRectangle.current);

                currentRectangle.current = null;
                rectangleStart.current = null;
            }
        }

        renderObjects();
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