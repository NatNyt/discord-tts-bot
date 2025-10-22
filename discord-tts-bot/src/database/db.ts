import { Client } from 'pg';
import { DB_FILE_NAME } from '../config/config';

const client = new Client({
    connectionString: DB_FILE_NAME,
});

export const connectDB = async () => {
    try {
        await client.connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

export const disconnectDB = async () => {
    try {
        await client.end();
        console.log('Database disconnected successfully');
    } catch (error) {
        console.error('Database disconnection error:', error);
        throw error;
    }
};

export const executeQuery = async (query: string, params: any[]) => {
    try {
        const res = await client.query(query, params);
        return res.rows;
    } catch (error) {
        console.error('Query execution error:', error);
        throw error;
    }
};