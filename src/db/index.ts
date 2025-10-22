import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';
const db = drizzle(process.env.DB_FILE_NAME!, {
    schema 
});

export default db;