import React, { useEffect, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background, EdgeProps, getBezierPath, Node, Edge } from 'react-flow-renderer';
import axios from 'axios';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) => {
    const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

    return (
        <g>
            <path
                id={id}
                style={{ stroke: 'blue', strokeWidth: 2 }}
                d={path}
            />
            <text
                x={(sourceX + targetX) / 2}
                y={(sourceY + targetY) / 2 - 10}
                fill="#000"
                fontSize="12px"
                textAnchor="middle"
            >
                {data.latency} ms
            </text>
        </g>
    );
};

const ServiceMap: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/validate_clickhouse');
                const data = response.data.data;

                const logs = data.split('\n').filter(line => line.trim() !== '').map(line => JSON.parse(line));

                // Generate nodes
                const nodeMap: Record<string, Node> = {};
                logs.forEach((log: any) => {
                    if (!nodeMap[log.service_name]) {
                        nodeMap[log.service_name] = {
                            id: log.service_name,
                            data: { label: `${log.service_name}\n(${log.log_level})` },
                            position: { x: Math.random() * 600, y: Math.random() * 400 },
                            style: {
                                backgroundColor: log.log_level === 'info' ? 'lightgreen' : 'lightcoral',
                                color: '#000',
                                borderRadius: 5
                            }
                        };
                    }
                });

                const nodesArray = Object.values(nodeMap);

                console.log('Nodes:', nodesArray);

                const edgeList: Edge[] = [];

                logs.forEach((log: any) => {
                    if (log.log_level === 'info') {
                        logs.forEach((targetLog: any) => {
                            if (targetLog.log_level === 'warn' && log.additional_info?.includes(targetLog.service_name)) {
                                edgeList.push({
                                    id: `e-${log.service_name}-${targetLog.service_name}`,
                                    source: log.service_name,
                                    target: targetLog.service_name,
                                    type: 'custom',
                                    animated: false,
                                    data: {
                                        latency: log.latency || 'N/A',
                                        status: log.log_level || 'info'
                                    }
                                });
                            }
                        });
                    }
                });

                console.log('Edges:', edgeList);

                setNodes(nodesArray);
                setEdges(edgeList);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="h-96 w-full border border-gray-300 bg-gray-900">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                edgeTypes={{custom: CustomEdge}}
                fitView
            >
                <MiniMap/>
                <Controls/>
                <Background/>
            </ReactFlow>
        </div>
    );
};

export default ServiceMap;
