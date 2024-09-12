import { useState, useEffect } from 'react';

const useFetchData = (url: string) => {
    const [data, setData] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                const result = await response.json();
                setData(result.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [url]);

    return data;
};

export default function Chat() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ id: string; role: 'user' | 'ai'; content: string }[]>([]);
    const data = useFetchData('/api/validate_clickhouse');

    const processQuery = (query: string, data: string) => {
        if (!data || typeof data !== 'string') {
            return "No data available.";
        }

        const parsedData = data.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));

        if (query.toLowerCase().includes('latency')) {
            const servicesWithLatency3 = parsedData.filter((entry: any) => entry.latency === 3);
            return `Services with latency 3: ${servicesWithLatency3.map((entry: any) => entry.service_name).join(', ')}`;
        }
        if (query.toLowerCase().includes('warn')) {
            const warnLevelServices = parsedData.filter((entry: any) => entry.log_level === 'warn');
            return `Services with log level 'warn': ${warnLevelServices.map((entry: any) => entry.service_name).join(', ')}`;
        }

        return "I can't answer that question.";
    };

    const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = processQuery(query, data);

        setMessages([...messages, { id: `${messages.length}`, role: 'user', content: query }]);
        setMessages([...messages, { id: `${messages.length + 1}`, role: 'ai', content: response }]);
        setQuery('');
    };

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto h-[80vh] bg-gray-100 p-4 rounded-lg shadow-md">
            <div className="flex flex-row gap-4 h-full">
                <div className="flex-1 flex flex-col">
                    <form onSubmit={handleChatSubmit} className="flex flex-col h-full">
                        <input
                            className="w-full p-3 border border-gray-300 rounded shadow-md text-black"
                            value={query}
                            placeholder="Say something..."
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className="mt-2 bg-blue-500 text-white py-2 px-4 rounded">Send</button>
                    </form>
                </div>
                <div
                    className="flex-1 flex flex-col overflow-y-auto p-4 bg-white rounded border border-gray-300 text-black">
                    {messages.map(m => (
                        <div key={m.id} className="whitespace-pre-wrap mb-2">
                            <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
                            {m.content}
                        </div>
                    ))}
                </div>
            </div>
        </div>


    );
}
