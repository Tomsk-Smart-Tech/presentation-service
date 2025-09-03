// src/__mocks__/react-konva.tsx
import React from 'react';

// Создаем простые компоненты-заглушки, которые просто рендерят дочерние элементы.
// Мы используем React.forwardRef, потому что Transformer использует ref.

export const Stage = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
);
export const Layer = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
);
export const Rect = (props: any) => <div {...props} />;
export const Text = (props: any) => <div {...props} />;
export const Transformer = React.forwardRef((props, ref) => <div {...props} ref={ref as any} />);