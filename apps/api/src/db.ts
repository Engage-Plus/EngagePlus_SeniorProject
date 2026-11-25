// Single Prisma client for the API process. Created on first use so the
// server (and tests that don't touch the DB) can start without a database.
import { PrismaClient } from "@prisma/client";

let client: PrismaClient | undefined;

export function db(): PrismaClient {
  client ??= new PrismaClient();
  return client;
}

export async function disconnectDb(): Promise<void> {
  if (client) await client.$disconnect();
  client = undefined;
}
