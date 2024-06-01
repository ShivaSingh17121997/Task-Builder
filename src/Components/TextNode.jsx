// src/components/TextNode.jsx
import React from 'react';
import { Handle } from 'react-flow-renderer';

const TextNode = ({ data }) => {
    return (
        <div className="text-node">
            <Handle type="target" position="top" />
            <div>{data.text}</div>
            <Handle type="source" position="bottom" />
        </div>
    );
};

export default TextNode;
