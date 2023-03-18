import {
    FC,
    useEffect,
    useRef,
    useState,
    DragEvent,
    DragEventHandler,
} from "react";
import ReactFlow, {
    ReactFlowProvider,
    NodeChange,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    applyNodeChanges,
    EdgeChange,
    applyEdgeChanges,
    addEdge,
    ConnectionLineType,
    ReactFlowInstance,
} from "reactflow";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { v4 as uuid } from "uuid";

import "reactflow/dist/style.css";

const App: FC = () => {
    const doc = useRef<Y.Doc>(new Y.Doc());
    const data = useRef<Y.Map<any>>(doc.current.getMap());
    const reactflow = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] =
        useState<ReactFlowInstance | null>(null);
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);

    const onNodesChange = (changes: NodeChange[]) => {
        data.current.set("nodes", applyNodeChanges(changes, nodes));
    };

    const onEdgesChange = (changes: EdgeChange[]) => {
        data.current.set("edges", applyEdgeChanges(changes, edges));
    };

    const onConnect = (params: any) => {
        data.current.set(
            "edges",
            addEdge(
                {
                    ...params,
                    type: ConnectionLineType.SmoothStep,
                    animated: true,
                },
                edges
            )
        );
    };

    const onDragStart = (
        event: DragEvent<HTMLDivElement>,
        nodeType: string
    ) => {
        if (!event.dataTransfer) {
            return;
        }
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        if (!reactflow.current || !reactFlowInstance) {
            return;
        }
        const reactFlowBounds = reactflow.current.getBoundingClientRect();
        const type = event.dataTransfer.getData("application/reactflow");
        // check if the dropped element is valid
        if (typeof type === "undefined" || !type) {
            return;
        }
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });
        const newNode = {
            id: uuid(),
            type,
            position,
            data: { label: "Node" },
        };
        data.current.set("nodes", nodes.concat(newNode));
    };

    const save = async () => {
        try {
            const body = JSON.stringify({ nodes, edges });
            const response = await fetch("http://localhost:5000/data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body,
            });
            console.info(await response.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetch("http://localhost:5000/data");
            const { nodes: initialNodes, edges: initialEdges } =
                await response.json();
            data.current.set("nodes", initialNodes);
            data.current.set("edges", initialEdges);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        (async () => {
            if (!doc.current) {
                return;
            }
            new WebrtcProvider("interactive-flowchart", doc.current);
            const existing = await new Promise((resolve) => {
                setTimeout(() => {
                    const existingNodes = data.current.get("nodes");
                    resolve(existingNodes);
                }, 100);
            });
            if (!existing) {
                await fetchData();
            }
            const initialNodes = data.current.get("nodes");
            if (initialNodes?.length > 0) {
                setNodes(initialNodes);
            }
            const initialEdges = data.current.get("edges");
            if (initialEdges?.length > 0) {
                setEdges(initialEdges);
            }
            doc.current.getMap().observeDeep(() => {
                const initialNodes = data.current.get("nodes");
                if (initialNodes?.length > 0) {
                    setNodes(initialNodes);
                }
                const initialEdges = data.current.get("edges");
                if (initialEdges?.length > 0) {
                    setEdges(initialEdges);
                }
            });
        })();
    }, [doc]);

    return (
        <ReactFlowProvider>
            <div style={{ width: "100%", height: "98vh" }} ref={reactflow}>
                <button style={{ position: "fixed", zIndex: 5 }} onClick={save}>
                    Save Changes
                </button>
                <div
                    style={{
                        position: "absolute",
                        top: 5,
                        right: 20,
                        zIndex: 5,
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            textAlign: "center",
                        }}
                    >
                        Drag Some Nodes Over!
                    </div>
                    <br />
                    <div
                        onDragStart={(event) => onDragStart(event, "default")}
                        style={{
                            width: "100%",
                            padding: "5px",
                            border: "1px solid black",
                            borderRadius: "5px",
                            textAlign: "center",
                        }}
                        draggable
                    >
                        Node
                    </div>
                </div>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    minZoom={0.1}
                    fitView
                >
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    );
};

export default App;
