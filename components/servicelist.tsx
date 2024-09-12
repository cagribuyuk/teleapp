import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ServiceLog {
    service_name: string;
    log_level: string;
    latency: string;
    timestamp: string;
}

const ServiceList: React.FC = () => {
    const [services, setServices] = useState<Record<string, ServiceLog[]>>({});
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/validate_clickhouse');
                const data = response.data.data;

                const logs = data.split('\n').filter(line => line.trim() !== '').map(line => JSON.parse(line));

                // Organize services by service_name
                const serviceMap: Record<string, ServiceLog[]> = {};
                logs.forEach((log: ServiceLog) => {
                    if (!serviceMap[log.service_name]) {
                        serviceMap[log.service_name] = [];
                    }
                    serviceMap[log.service_name].push(log);
                });

                setServices(serviceMap);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchData();
    }, []);

    const toggleExpand = (serviceName: string) => {
        setExpanded(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serviceName)) {
                newSet.delete(serviceName);
            } else {
                newSet.add(serviceName);
            }
            return newSet;
        });
    };

    const getLogLevelColor = (logLevel: string) => {
        switch (logLevel) {
            case 'info':
                return 'text-green-600';
            case 'warn':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-700">Service List</h2>
            <table className="w-full border-collapse">
                <thead>
                <tr className="bg-black border-b">
                    <th className="p-2 text-left">Service Name</th>
                    <th className="p-2 text-left">Log Level</th>
                    <th className="p-2 text-left">Details</th>
                </tr>
                </thead>
                <tbody>
                {Object.entries(services).map(([serviceName, logs]) => (
                    <React.Fragment key={serviceName}>
                        <tr className="border-b">
                            <td className="p-2">
                                <button
                                    onClick={() => toggleExpand(serviceName)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {serviceName}
                                </button>
                            </td>
                            <td className={`p-2 ${getLogLevelColor(logs[0].log_level)}`}>{logs[0].log_level}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => toggleExpand(serviceName)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {expanded.has(serviceName) ? 'Collapse' : 'Expand'}
                                </button>
                            </td>
                        </tr>
                        {expanded.has(serviceName) && (
                            <tr className="bg-gray-50">
                                <td colSpan={3}>
                                    <div className="p-4">
                                        <ul className="list-disc pl-5">
                                            {logs.map((log, index) => (
                                                <li key={index} className="mb-2">
                                                    <p className="font-medium text-gray-600">Latency: {log.latency} ms</p>
                                                    <p className="text-gray-600">Timestamp: {new Date(log.timestamp).toLocaleString()}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ServiceList;
