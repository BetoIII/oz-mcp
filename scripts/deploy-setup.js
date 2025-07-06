#!/usr/bin/env node

const { OpportunityZoneSeeder } = require('./seed-opportunity-zones');

/**
 * Deployment setup script
 * This script ensures the database is properly seeded for production deployment
 */
async function deploySetup() {
  console.log('🚀 Starting deployment setup...');
  
  const seeder = new OpportunityZoneSeeder();
  
  try {
    // Check if database already has data
    const isHealthy = await seeder.checkDatabaseHealth();
    
    if (isHealthy) {
      console.log('✅ Database is already seeded and healthy');
      return;
    }
    
    console.log('🌱 Database needs seeding, starting process...');
    await seeder.seedDatabase();
    
    console.log('✅ Deployment setup complete!');
    
  } catch (error) {
    console.error('❌ Deployment setup failed:', error.message);
    
    // Provide helpful error guidance
    if (error.message.includes('timeout')) {
      console.error('💡 Network timeout - this is common in serverless environments');
      console.error('💡 Consider running the seeding script during your CI/CD pipeline');
    } else if (error.message.includes('DATABASE_URL')) {
      console.error('💡 Database connection issue - check your DATABASE_URL environment variable');
    } else if (error.message.includes('fetch')) {
      console.error('💡 Network error - check your internet connection and data source URL');
    } else if (error.message.includes('connection closed')) {
      console.error('💡 Database connection was closed - this may happen with large datasets');
    }
    
    console.error('');
    console.error('For manual seeding, run:');
    console.error('  npm run seed');
    console.error('');
    console.error('For preprocessed data, run:');
    console.error('  npm run optimize');
    
    // Always continue with production builds - app can work without seeded data
    console.warn('⚠️  Production build continuing without seeded data');
    console.warn('⚠️  App will attempt to download and cache data on first request');
    
  } finally {
    await seeder.cleanup();
  }
}

// Run if this script is called directly
if (require.main === module) {
  deploySetup();
}

module.exports = { deploySetup };