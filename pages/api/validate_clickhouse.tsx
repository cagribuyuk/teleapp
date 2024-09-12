import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const CLICKHOUSE_API_URL = 'https://console-api.clickhouse.cloud/.api/query-endpoints/d217e4a1-ad17-4fa8-861b-03ef3ea4cb09/run?format=JSONEachRow';
const CLICKHOUSE_API_KEY_ID = 'L5teuxchb3YWFNk2qX3A';
const CLICKHOUSE_API_KEY_SECRET = '4b1d70P5grJINn1lrYYE8NN8g02SLrx6YTWzGGeEH0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const query = `SELECT * FROM logs LIMIT 31 OFFSET 0;`;

        const response = await axios.post(
            CLICKHOUSE_API_URL,
            { query },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: CLICKHOUSE_API_KEY_ID,
                    password: CLICKHOUSE_API_KEY_SECRET,
                },
            }
        );

        res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch data from ClickHouse',
            error: error.message,
        });
    }
}
