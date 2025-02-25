import pg, { type PoolConfig, type Pool } from 'pg'

export type PoolType = Pool

export function createPool(): PoolType {

    const postgresOptions: PoolConfig = {
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: '123',
        database: 'vector_store',
    }

    const pool = new pg.Pool(postgresOptions)

    return pool
}

export async function endPool(pool: PoolType) {
    return pool.end()
}