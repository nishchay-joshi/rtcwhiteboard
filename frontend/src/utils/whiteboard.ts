import type { Point, WhiteboardObject } from "../types/whiteboard";

export function getObjectBounds(object: WhiteboardObject) {
    if (object.type === "rectangle") {
        return {
            minX: object.x,
            minY: object.y,
            maxX: object.x + object.width,
            maxY: object.y + object.height,
        };
    }

    if (object.type === "stroke") {
        const xs = object.points.map(point => point.x);
        const ys = object.points.map(point => point.y);

        return {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs),
            maxY: Math.max(...ys),
        };
    }

    throw new Error("Unsupported object type:");
}

export function isPointInsideBounds(point: Point, object: WhiteboardObject, padding = 0) {
    const bounds = getObjectBounds(object);

    return (
        point.x >= bounds.minX - padding &&
        point.x <= bounds.maxX + padding &&
        point.y >= bounds.minY - padding &&
        point.y <= bounds.maxY + padding
    );
}

export function moveObject(object: WhiteboardObject, dx: number, dy: number) {
    if (object.type === "rectangle") {
        object.x += dx;
        object.y += dy;
    }

    if (object.type === "stroke") {
        for (const point of object.points) {
            point.x += dx;
            point.y += dy;
        }
    }
}