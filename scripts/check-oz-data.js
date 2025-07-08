const { PrismaClient } = require('../src/generated/prisma');

async function checkOpportunityZoneData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking opportunity zone data...');
    
    // Check if table exists and has data
    const count = await prisma.opportunityZone.count();
    console.log(`📊 Found ${count} opportunity zones in database`);
    
    if (count > 0) {
      // Get a sample record
      const sample = await prisma.opportunityZone.findFirst({
        select: {
          id: true,
          state: true,
          county: true,
          tractNumber: true
        }
      });
      console.log('📍 Sample record:', sample);
      console.log('✅ Database seeding appears successful!');
    } else {
      console.log('⚠️  No opportunity zone data found - seeding may have failed');
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOpportunityZoneData();
