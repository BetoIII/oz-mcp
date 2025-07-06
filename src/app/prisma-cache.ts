import { PrismaClient } from '@/generated/prisma-cache';

// Cache database Prisma client for optimization models
// This connects to the Prisma Postgres database for performance optimization
const prismaCache = global.prismaCache || new PrismaClient({
  datasources: {
    db: {
      url: process.env.CACHE_STORAGE_POSTGRES_URL,
    },
  },
  ...(process.env.NODE_ENV === 'production' && {
    log: ['error', 'warn'],
    errorFormat: 'minimal',
  }),
});

if (process.env.NODE_ENV !== 'production') {
  global.prismaCache = prismaCache;
}

export { prismaCache };

declare global {
  var prismaCache: PrismaClient | undefined;
}