import React from 'react';

const stripKonvaProps = (props: any) => {
    const { cornerRadius, ...rest } = props;
    return rest;
};

export const Stage = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...stripKonvaProps(props)}>{children}</div>
);
export const Layer = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...stripKonvaProps(props)}>{children}</div>
);
export const Rect = (props: any) => <div {...stripKonvaProps(props)} />;
export const Text = (props: any) => <div {...stripKonvaProps(props)} />;

export const Transformer = React.forwardRef((props: any, ref) => {

    React.useImperativeHandle(ref, () => ({

        nodes: jest.fn(),
    }));

    return <div {...stripKonvaProps(props)} />;
});