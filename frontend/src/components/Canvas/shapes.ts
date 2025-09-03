export interface BaseShape {
    id: string;
    x: number;
    y: number;
    fill: string;
}

export interface RectShape extends BaseShape {
    type: 'rect';
    width: number;
    height: number;
}

export interface TextShape extends BaseShape {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
}

export type Shape = RectShape | TextShape;