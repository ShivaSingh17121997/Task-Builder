// src/components/FlowBuilder.jsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
} from 'react-flow-renderer';
import TextNode from './TextNode';
import 'react-flow-renderer/dist/style.css';

const initialNodes = [
    {
        id: '1',
        type: 'textNode',
        position: { x: 250, y: 5 },
        data: { text: 'Welcome to the Chatbot' },
    },
];

const FlowBuilder = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [newNodeText, setNewNodeText] = useState('');

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onInit = useCallback((instance) => setReactFlowInstance(instance), []);

    const onNodeClick = (event, node) => {
        setSelectedNode(node);
    };

    const handleTextChange = (event) => {
        const updatedText = event.target.value;
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    node = { ...node, data: { ...node.data, text: updatedText } };
                }
                return node;
            })
        );
        setSelectedNode((node) => ({
            ...node,
            data: { ...node.data, text: updatedText },
        }));
    };

    const handleNewNodeTextChange = (event) => {
        setNewNodeText(event.target.value);
    };

    const handleAddNode = () => {
        const id = `${nodes.length + 1}`;
        const newNode = {
            id,
            type: 'textNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 },
            data: { text: newNodeText },
        };
        setNodes((nds) => nds.concat(newNode));

        // Automatically connect the new node to the last node
        if (nodes.length > 0) {
            const newEdge = {
                id: `e${nodes.length}-${id}`,
                source: nodes[nodes.length - 1].id,
                target: id,
            };
            setEdges((eds) => eds.concat(newEdge));
        }

        setNewNodeText('');
    };

    const handleDeleteNode = () => {
        if (!selectedNode) return;

        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
        setSelectedNode(null);
    };

    const handleSave = () => {
        const nodesWithEmptyTargetHandles = nodes.filter((node) => {
            const nodeEdges = edges.filter((edge) => edge.source === node.id);
            return nodeEdges.length === 0;
        });

        if (nodesWithEmptyTargetHandles.length > 1) {
            alert('More than one node has empty target handles.');
        } else {
            // Save the flow
            console.log('Flow saved:', { nodes, edges });
        }
    };

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowInstance.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');
            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode = {
                id: `${nodes.length + 1}`,
                type,
                position,
                data: { text: 'New Text Node' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, nodes, setNodes]
    );

    return (
        <div className="flow-builder">
            <ReactFlowProvider>
                <div className="nodes-panel">
                    <div
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'textNode')}
                        className="node-panel-item"
                    >
                        Text Node
                    </div>
                </div>

                <div className="settings-panel">
                    {selectedNode && (
                        <div>
                            <label>Text:</label>
                            <input
                                type="text"
                                value={selectedNode.data.text}
                                onChange={handleTextChange}
                            />
                            <button onClick={handleDeleteNode}>Delete Node</button>
                        </div>
                    )}
                    <div>
                        <label>Add New Node:</label>
                        <input
                            type="text"
                            value={newNodeText}
                            onChange={handleNewNodeTextChange}
                        />
                        <button onClick={handleAddNode}>Add Node</button>
                    </div>
                </div>

                <div className="flow-canvas" onDragOver={onDragOver} onDrop={onDrop}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={onInit}
                        nodeTypes={{ textNode: TextNode }}
                        onNodeClick={onNodeClick}
                    >
                        <MiniMap />
                        <Controls />
                        <Background variant={BackgroundVariant.Dots} />
                    </ReactFlow>
                    <button onClick={handleSave}>Save Flow</button>
                </div>
            </ReactFlowProvider>
        </div>
    );
};

export default FlowBuilder;
