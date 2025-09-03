// src/components/Canvas/shapes.ts
export interface BaseShape {
    id: string;
    x: number;
    y: number;
    fill: string;
    rotation: number;
}

export interface RectShape extends BaseShape {
    type: 'rect';
    width: number;
    height: number;
}

export interface CircleShape extends BaseShape {
    type: 'circle';
    width: number;
    height: number;
}

export interface TriangleShape extends BaseShape {
    type: 'triangle';
    width: number;
    height: number;
}

// FIX: Добавляем 'height' в TextShape, чтобы все фигуры имели размеры
export interface TextShape extends BaseShape {
    type: 'text';
    text: string;
    fontSize: number;
    width: number;
    height: number;
}

export type Shape = RectShape | CircleShape | TriangleShape | TextShape;