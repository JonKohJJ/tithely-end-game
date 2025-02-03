// npm i drizzle-orm postgres
// npm i -D drizzle-kit

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL as string

export const client = postgres(connectionString, { prepare: false })
export const db = drizzle({ client, schema });

// npm i dotenv
// npx drizzle-kit generate
// npx drizzle-kit migrate
// npx drizzle-kit drop