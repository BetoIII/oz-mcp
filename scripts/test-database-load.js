const { OpportunityZoneService } = require('../src/lib/services/opportunity-zones.ts');

async function testDatabaseLoad() {
  console.log('🧪 Testing database load performance...');
  
  try {
    const service = OpportunityZoneService.getInstance();
    
    // Test the initialization
    const startTime = Date.now();
    await service.initialize();
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Database load test completed in ${totalTime}ms`);
    
    // Test a point lookup to ensure everything works
    const result = await service.checkPoint(40.7128, -74.0060); // NYC coordinates
    console.log(`🎯 Point lookup test: ${result.isInZone ? 'In zone' : 'Not in zone'}`);
    
    // Get cache metrics
    const metrics = service.getCacheMetrics();
    console.log(`📊 Cache metrics:`, metrics);
    
  } catch (error) {
    console.error('❌ Database load test failed:', error.message);
  }
}

testDatabaseLoad(); 