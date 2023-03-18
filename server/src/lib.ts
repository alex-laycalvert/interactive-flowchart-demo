import { Node, Edge } from "reactflow";
import { v4 as uuid } from "uuid";

const sizeFactor = 200;

export const makeData = (): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            nodes.push({
                id: uuid(),
                data: {
                    label: `Node ${i}, ${j}`,
                },
                position: {
                    x: i * sizeFactor,
                    y: j * sizeFactor,
                },
            });
        }
    }

    return { nodes, edges };
};
