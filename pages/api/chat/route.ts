import { openai } from '@ai-sdk/openai';
import { streamText, StreamData } from 'ai';

const CLICKHOUSE_API_URL = 'https://console-api.clickhouse.cloud/.api/query-endpoints/d217e4a1-ad17-4fa8-861b-03ef3ea4cb09/run?format=JSONEachRow';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const response = await fetch(CLICKHOUSE_API_URL);
    const result = await response.json();

    const rawData = result.data;
    const data = rawData.split('\n').map(line => JSON.parse(line));

    const streamData = new StreamData();
    streamData.append(data);

    const resultStream = await streamText({
        model: openai('gpt-4-turbo'),
        messages,
        onFinish() {
            streamData.close();
        },
    });

    return resultStream.toDataStreamResponse({ data: streamData });
}
