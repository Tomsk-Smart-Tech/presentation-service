import React, { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { ImageShape } from '../../types';

interface URLImageProps {
    shape: ImageShape;
    [key: string]: any;
}

export const URLImage = ({ shape, ...restProps }: URLImageProps) => {
    const [image, setImage] = useState<HTMLImageElement | undefined>();

    useEffect(() => {
        const img = new window.Image();
        img.src = shape.src;
        img.crossOrigin = 'Anonymous';
        img.onload = () => setImage(img);
    }, [shape.src]);

    return <KonvaImage image={image} {...shape} {...restProps} />;
};