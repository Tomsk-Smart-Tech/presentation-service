import React, { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { ImageShape } from '../../types';

/**
 * Props for the URLImage component.
 */
interface URLImageProps {
    /** The image shape data containing the source URL. */
    shape: ImageShape;
    /** Additional props to be passed to the Konva Image component. */
    [key: string]: any;
}

/**
 * A wrapper around `react-konva`'s Image component that handles asynchronous image loading.
 *
 * It takes a URL, loads the image, and then renders it on the Konva canvas.
 *
 * @param {URLImageProps} props - The component props.
 * @returns {JSX.Element} The rendered Konva Image component.
 */
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