// npm i drizzle-orm postgres
// npm i -D drizzle-kit

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { env } from '@/data/env/server';

export const client = postgres(env.DATABASE_URL, { prepare: false })
export const db = drizzle({ client, schema });

// npm i dotenv
// npx drizzle-kit generate
// npx drizzle-kit migrate
// npx drizzle-kit drop