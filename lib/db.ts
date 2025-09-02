import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof createPrismaClient> | undefined;
}

function createPrismaClient() {
  const client = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate());
  return client;
}

export const db = globalThis.prismaGlobal ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}


