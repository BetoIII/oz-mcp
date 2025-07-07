import { PrismaClient } from '@/generated/prisma';

// Add connection health check
async function checkDatabaseConnection(prismaInstance: PrismaClient) {
  try {
    await prismaInstance.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.warn('⚠️ Database connection failed:', error);
    return false;
  }
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: https://pris.ly/d/help/next-js-best-practices

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
  
  // Check connection in development
  if (process.env.DATABASE_URL) {
    checkDatabaseConnection(prisma).catch((error) => {
      console.warn('Database health check failed:', error);
    });
  } else {
    console.warn('⚠️ DATABASE_URL not configured - using JWT sessions only');
  }
}

export { prisma };

declare global {
  var prisma: PrismaClient | undefined;
} 
