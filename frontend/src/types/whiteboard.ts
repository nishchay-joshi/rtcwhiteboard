export type Point = {
    x: number;
    y: number;
};

export type Stroke = {
    id: string;
    type: "stroke";
    points: Point[];
    color: string;
    width: number;
};

export type Rectangle = {
    id: string;
    type: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    lineWidth: number;
};

export type WhiteboardObject = Stroke | Rectangle;