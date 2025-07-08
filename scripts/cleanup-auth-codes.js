const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function cleanupExpiredAuthCodes() {
  try {
    console.log('Starting cleanup of expired authorization codes...');
    
    const now = new Date();
    const result = await prisma.authCode.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });
    
    console.log(`Cleaned up ${result.count} expired authorization codes.`);
    
    // Also show current count of active codes
    const activeCount = await prisma.authCode.count();
    console.log(`${activeCount} active authorization codes remaining.`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupExpiredAuthCodes(); 