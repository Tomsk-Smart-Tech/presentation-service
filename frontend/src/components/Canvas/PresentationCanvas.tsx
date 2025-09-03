import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Shape, RectShape, TextShape } from './shapes';
import Konva from 'konva';

interface PresentationCanvasProps {
    shapes: Shape[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onUpdate: (id: string, newAttrs: Partial<Shape>) => void;
}

export const PresentationCanvas = ({
                                       shapes,
                                       selectedId,
                                       onSelect,
                                       onUpdate,
                                   }: PresentationCanvasProps) => {
    const stageRef = useRef<Konva.Stage>(null);
    const trRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (!trRef.current) {
            return;
        }

        const stage = stageRef.current;
        if (!stage) {
            return;
        }

        if (selectedId) {
            const selectedNode = stage.findOne('#' + selectedId);

            if (selectedNode) {
                console.log('DEBUG: Нашел узел для трансформации:', selectedNode);
                trRef.current.nodes([selectedNode]);
            } else {
                console.log('DEBUG: НЕ нашел узел с ID:', selectedId);
                trRef.current.nodes([]);
            }
        } else {
            trRef.current.nodes([]);
        }
    }, [selectedId]);

    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.attrs.fill === 'white';
        if (clickedOnEmpty) {
            onSelect(null);
        }
    };

    return (
        <div className="canvas-container">
            <Stage
                ref={stageRef}
                width={window.innerWidth - 590}
                height={window.innerHeight - 80}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
            >
                <Layer>
                    <Rect
                        x={20}
                        y={20}
                        width={window.innerWidth - 630}
                        height={window.innerHeight - 120}
                        fill="white"
                        cornerRadius={10}
                    />

                    {shapes.map((shape) => {
                        const commonProps = {
                            key: shape.id,
                            id: shape.id,
                            x: shape.x,
                            y: shape.y,
                            fill: shape.fill,
                            draggable: true,
                            onClick: () => {
                                console.log('DEBUG: Клик по фигуре ID:', shape.id);
                                onSelect(shape.id);
                            },
                            onTap: () => {
                                console.log('DEBUG: Тап по фигуре ID:', shape.id);
                                onSelect(shape.id);
                            },
                            onDragEnd: (e: KonvaEventObject<DragEvent>) => {
                                onUpdate(shape.id, { x: e.target.x(), y: e.target.y() });
                            },
                            onTransformEnd: (e: KonvaEventObject<Event>) => {
                                const node = e.target;
                                const scaleX = node.scaleX();
                                const scaleY = node.scaleY();
                                node.scaleX(1);
                                node.scaleY(1);

                                let newAttrs: Partial<Shape> = {};
                                if (shape.type === 'rect') {
                                    newAttrs = {
                                        x: node.x(),
                                        y: node.y(),
                                        width: Math.max(5, node.width() * scaleX),
                                        height: Math.max(5, node.height() * scaleY),
                                    };
                                }
                                if (shape.type === 'text') {
                                    newAttrs = {
                                        x: node.x(),
                                        y: node.y(),
                                        fontSize: Math.round((shape as TextShape).fontSize * scaleX)
                                    };
                                }

                                console.log('DEBUG: Трансформация завершена. Новые атрибуты:', newAttrs);
                                onUpdate(shape.id, newAttrs);
                            },
                        };

                        if (shape.type === 'rect') {
                            const rectShape = shape as RectShape;
                            return <Rect {...commonProps} width={rectShape.width} height={rectShape.height} />;
                        }

                        if (shape.type === 'text') {
                            const textShape = shape as TextShape;
                            return <Text {...commonProps} text={textShape.text} fontSize={textShape.fontSize} fontFamily={textShape.fontFamily} />;
                        }
                        return null;
                    })}
                    <Transformer ref={trRef} />
                </Layer>
            </Stage>
        </div>
    );
};