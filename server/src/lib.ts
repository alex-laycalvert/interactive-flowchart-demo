import { Node, Edge } from "reactflow";

export const makeData = (): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    return { nodes, edges };
};
