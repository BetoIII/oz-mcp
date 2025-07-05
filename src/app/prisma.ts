import { PrismaClient } from '@/generated/prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: https://pris.ly/d/help/next-js-best-practices

const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  ...(process.env.NODE_ENV === 'production' && {
    log: ['error', 'warn'],
    errorFormat: 'minimal',
  }),
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };

declare global {
  var prisma: PrismaClient | undefined;
} 
