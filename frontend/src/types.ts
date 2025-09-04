// src/types.ts
export interface BaseShape {
    id: string;
    x: number;
    y: number;
    fill: string;
    rotation: number;
    width: number;
    height: number;
}

export interface RectShape extends BaseShape { type: 'rect'; }
export interface CircleShape extends BaseShape { type: 'circle'; }
export interface TriangleShape extends BaseShape { type: 'triangle'; }

export interface TextShape extends BaseShape {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
}

export interface ImageShape extends BaseShape {
    type: 'image';
    src: string;
}

export type Shape = RectShape | CircleShape | TriangleShape | TextShape | ImageShape;

export interface Slide {
    id: string;
    shapes: Shape[];
}