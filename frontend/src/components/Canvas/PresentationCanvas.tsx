// src/components/Canvas/PresentationCanvas.tsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Ellipse, RegularPolygon, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Shape } from '../../types';
import Konva from 'konva';
import { URLImage } from './URLImage';

const LOGICAL_WIDTH = 1280;

interface PresentationCanvasProps {
    shapes: Shape[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onUpdate: (id: string, newAttrs: Partial<Shape>) => void;
    aspectRatio: string;
}

export const PresentationCanvas = ({ shapes, selectedId, onSelect, onUpdate, aspectRatio }: PresentationCanvasProps) => {
    const stageRef = useRef<Konva.Stage>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver(() => {
            setSize({ width: container.clientWidth, height: container.clientHeight });
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const slideProps = useMemo(() => {
        const PADDING = 40;
        const containerWidth = size.width - PADDING;
        const containerHeight = size.height - PADDING;
        if (containerWidth <= 0 || containerHeight <= 0) return { width: 0, height: 0, x: 0, y: 0 };
        const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
        const targetRatio = ratioW / ratioH;
        let slideWidth = containerWidth;
        let slideHeight = containerWidth / targetRatio;
        if (slideHeight > containerHeight) {
            slideHeight = containerHeight;
            slideWidth = containerHeight * targetRatio;
        }
        return { width: slideWidth, height: slideHeight, x: (size.width - slideWidth) / 2, y: (size.height - slideHeight) / 2 };
    }, [size.width, size.height, aspectRatio]);

    useEffect(() => {
        if (!trRef.current || !stageRef.current) return;
        if (selectedId) {
            const selectedNode = stageRef.current.findOne('#' + selectedId);
            trRef.current.nodes(selectedNode ? [selectedNode] : []);
        } else {
            trRef.current.nodes([]);
        }
    }, [selectedId, shapes]);

    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        const clickedOnEmpty = e.target.name() === 'slide-background' || e.target === e.target.getStage();
        if (clickedOnEmpty) {
            onSelect(null);
        }
    };

    const scale = slideProps.width / LOGICAL_WIDTH;

    return (
        <div className="canvas-container" ref={containerRef}>
            <Stage ref={stageRef} width={size.width} height={size.height} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
                <Layer>
                    <Rect {...slideProps} fill="white" cornerRadius={8} name="slide-background" />
                    <Group x={slideProps.x} y={slideProps.y} scaleX={scale} scaleY={scale}>
                        {shapes.map((shape) => {
                            const commonProps = {
                                ...shape,
                                draggable: true,
                                onClick: () => onSelect(shape.id),
                                onTap: () => onSelect(shape.id),
                                onDragEnd: (e: KonvaEventObject<DragEvent>) => {
                                    onUpdate(shape.id, {
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    });
                                },
                            };
                            switch (shape.type) {
                                case 'rect': return <Rect key={shape.id} {...commonProps} />;
                                case 'circle': return <Ellipse key={shape.id} {...commonProps} radiusX={shape.width / 2} radiusY={shape.height / 2} />;
                                case 'triangle': return <RegularPolygon key={shape.id} {...commonProps} sides={3} radius={shape.height / 2} scaleX={shape.width / shape.height} />;
                                case 'text': return <Text key={shape.id} {...commonProps} verticalAlign="middle" />;
                                case 'image': return <URLImage key={shape.id} shape={shape} {...commonProps} />;
                                default: return null;
                            }
                        })}
                        <Transformer
                            ref={trRef} keepRatio={false} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
                            onTransformEnd={() => {
                                const node = trRef.current?.nodes()[0];
                                if (!node) return;
                                onUpdate(node.id(), {
                                    x: node.x(), y: node.y(), rotation: node.rotation(),
                                    width: node.width() * node.scaleX(), height: node.height() * node.scaleY(),
                                });
                                node.scaleX(1); node.scaleY(1);
                            }}
                        />
                    </Group>
                </Layer>
            </Stage>
        </div>
    );
};