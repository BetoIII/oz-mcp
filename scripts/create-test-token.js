const { PrismaClient } = require('../src/generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createTestToken() {
  try {
    console.log('Creating test access token...');

    // Find or create a test user
    let user = await prisma.user.findFirst({ where: { email: 'testuser@example.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          name: 'Test User',
        },
      });
      console.log('Test user created:', user.id);
    }

    // First, create a test client if it doesn't exist
    let client = await prisma.client.findFirst({
      where: { name: 'Test Client' }
    });

    if (!client) {
      console.log('Creating test client...');
      client = await prisma.client.create({
        data: {
          name: 'Test Client',
          redirectUris: ['http://localhost:3000/test'],
          clientSecret: crypto.randomBytes(32).toString('hex'),
          userId: user.id,
        },
      });
      console.log('Test client created:', client.clientId);
    }

    // Create a test access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.accessToken.create({
      data: {
        token: accessToken,
        expiresAt,
        clientId: client.id,
        userId: user.id,
      },
    });

    console.log('\n✅ Test access token created successfully!');
    console.log('Access Token:', accessToken);
    console.log('Expires At:', expiresAt.toISOString());
    console.log('\nYou can now use this token to test the MCP connection.');
    console.log('Visit http://localhost:3000/test and paste this token to test the connection.');
    
  } catch (error) {
    console.error('Error creating test token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestToken(); 