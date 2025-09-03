// src/__mocks__/react-konva.tsx
import React from 'react';

// Эта функция будет "съедать" пропсы, которые не являются валидными для DOM-элементов
const stripKonvaProps = (props: any) => {
    const { cornerRadius, ...rest } = props;
    return rest;
};

// Простые компоненты-заглушки
export const Stage = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...stripKonvaProps(props)}>{children}</div>
);
export const Layer = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...stripKonvaProps(props)}>{children}</div>
);
export const Rect = (props: any) => <div {...stripKonvaProps(props)} />;
export const Text = (props: any) => <div {...stripKonvaProps(props)} />;

// Самое важное изменение - улучшенный мок для Transformer
export const Transformer = React.forwardRef((props: any, ref) => {
    // Используем хук, чтобы создать кастомный объект для ref
    React.useImperativeHandle(ref, () => ({
        // Теперь у ref.current будет метод .nodes(), который ничего не делает,
        // но он существует, и тест не будет падать.
        nodes: jest.fn(),
    }));

    return <div {...stripKonvaProps(props)} />;
});