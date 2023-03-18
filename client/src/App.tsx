import { FC, useEffect, useRef } from "react";
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
} from "reactflow";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import "reactflow/dist/style.css";

const App: FC = () => {
    const doc = useRef<Y.Doc>(new Y.Doc());
    const data = useRef<Y.Map<any>>(doc.current.getMap());
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);

    const onNodesChange = (changes: NodeChange[]) => {
        data.current.set("nodes", applyNodeChanges(changes, nodes));
    };

    const onEdgesChange = (changes: EdgeChange[]) => {
        console.log("change");
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
            console.log(await response.json());
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
            setNodes(data.current.get("nodes"));
            setEdges(data.current.get("edges"));
            doc.current.getMap().observeDeep(() => {
                setNodes(data.current.get("nodes"));
                setEdges(data.current.get("edges"));
            });
        })();
    }, [doc]);

    return (
        <ReactFlowProvider>
            <div style={{ width: "100%", height: "100vh" }}>
                <button style={{}} onClick={save}>
                    Save Changes
                </button>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    minZoom={0.1}
                >
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    );
};

export default App;
