import { Pool, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_CONNECTION,
  ssl: {
    rejectUnauthorized: false,
  },
});

type QueryResult<T> = {
  rows: T[];
};

async function connectAndQuery<T extends QueryResultRow>(sqlCommand: string, params: any[] = []): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    const res = await client.query<T>(sqlCommand, params);
    console.log(res.rows);
    return { rows: res.rows }; 
  } catch (err) {
    console.error('Erro ao conectar ou consultar:', (err as Error).message);
    throw err;
  } finally {
    client.release();
    console.log('Conexão devolvida ao pool');
  }
}

export default connectAndQuery;
