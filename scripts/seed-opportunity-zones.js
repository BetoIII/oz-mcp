const { PrismaClient } = require('../src/generated/prisma');
const RBush = require('rbush').default;
const fetch = require('node-fetch');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const { OpportunityZonePreprocessor } = require('./preprocess-opportunity-zones');

const prisma = new PrismaClient();

class OpportunityZoneSeeder {
  constructor() {
    this.OZ_DATA_URL = process.env.OZ_DATA_URL || 'https://pub-757ceba6f52a4399beb76c4667a53f08.r2.dev/oz-all.geojson';
    this.REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  async downloadAndProcessData() {
    // First, try to use preprocessed data if available
    const preprocessor = new OpportunityZonePreprocessor();
    
    try {
      const { geoJson, metadata } = await preprocessor.getProcessedData();
      this.log('info', `📦 Using preprocessed data (${metadata.stats.featureCount} features, ${metadata.stats.compressionRatio}% compression)`);
      return geoJson;
    } catch (error) {
      this.log('info', '📦 No preprocessed data available, downloading from source...');
    }

    // Fallback to downloading raw data
    this.log('info', `🔗 Downloading opportunity zones data from: ${this.OZ_DATA_URL}`);
    
    const response = await fetch(this.OZ_DATA_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'OZ-MCP-Seeder/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.features?.length) {
      throw new Error('Invalid GeoJSON format: missing features array');
    }

    this.log('info', `📊 Processing ${data.features.length} features`);
    
    // Optimize GeoJSON by removing unnecessary properties
    const optimizedData = this.optimizeGeoJson(data);
    
    this.log('info', `✅ Optimized to ${optimizedData.features.length} features`);
    
    return optimizedData;
  }

  optimizeGeoJson(geoJson) {
    return {
      type: 'FeatureCollection',
      features: geoJson.features.map((feature) => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          GEOID: feature.properties?.GEOID || feature.properties?.CENSUSTRAC
        }
      }))
    };
  }

  calculateBBox(geometry) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const processCoordinates = (coords) => {
      const [lon, lat] = coords;
      minX = Math.min(minX, lon);
      minY = Math.min(minY, lat);
      maxX = Math.max(maxX, lon);
      maxY = Math.max(maxY, lat);
    };

    const processGeometry = (geom) => {
      if (geom.type === 'Polygon') {
        geom.coordinates[0].forEach(processCoordinates);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((polygon) => 
          polygon[0].forEach(processCoordinates)
        );
      }
    };

    processGeometry(geometry);
    return [minX, minY, maxX, maxY];
  }

  createSpatialIndex(geoJson) {
    const tree = new RBush();
    const items = geoJson.features.map((feature, index) => {
      const bbox = feature.bbox || this.calculateBBox(feature.geometry);
      return {
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        feature,
        index
      };
    });
    
    tree.load(items);
    return tree;
  }

  async calculateDataHash(geoJson) {
    const data = JSON.stringify(geoJson);
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
  }

  async seedDatabase() {
    try {
      this.log('info', '🌱 Starting database seeding process...');
      
      // Download and process data
      const geoJson = await this.downloadAndProcessData();
      
      // Calculate data hash
      const dataHash = await this.calculateDataHash(geoJson);
      
      // Check if we already have this data
      const existing = await prisma.opportunityZoneCache.findFirst({
        where: { dataHash },
        orderBy: { createdAt: 'desc' }
      });

      if (existing) {
        this.log('info', '📦 Data already exists in database with same hash, skipping seed');
        return;
      }

      // Create spatial index
      this.log('info', '🗂️  Creating spatial index...');
      const spatialIndex = this.createSpatialIndex(geoJson);
      const spatialIndexData = spatialIndex.all();

      // Clear old cache entries
      this.log('info', '🧹 Clearing old cache entries...');
      await prisma.opportunityZoneCache.deleteMany();

      // Save new cache
      this.log('info', '💾 Saving to database...');
      await prisma.opportunityZoneCache.create({
        data: {
          version: new Date().toISOString(),
          lastUpdated: new Date(),
          featureCount: geoJson.features.length,
          nextRefresh: new Date(Date.now() + this.REFRESH_INTERVAL),
          dataHash,
          geoJsonData: geoJson,
          spatialIndex: spatialIndexData
        }
      });

      this.log('success', `✅ Database seeding complete! Stored ${geoJson.features.length} features`);
      
    } catch (error) {
      this.log('error', `❌ Database seeding failed: ${error.message}`);
      throw error;
    }
  }

  async checkDatabaseHealth() {
    try {
      const cacheEntry = await prisma.opportunityZoneCache.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      if (!cacheEntry) {
        this.log('warning', '⚠️  No cache entry found in database');
        return false;
      }

      const isExpired = new Date() >= cacheEntry.nextRefresh;
      if (isExpired) {
        this.log('warning', '⚠️  Cache entry is expired');
        return false;
      }

      this.log('info', `✅ Database health check passed. ${cacheEntry.featureCount} features cached`);
      return true;
    } catch (error) {
      this.log('error', `❌ Database health check failed: ${error.message}`);
      return false;
    }
  }

  async cleanup() {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const seeder = new OpportunityZoneSeeder();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--check')) {
      await seeder.checkDatabaseHealth();
    } else if (args.includes('--force')) {
      await seeder.seedDatabase();
    } else {
      // Default: Check health first, seed if needed
      const isHealthy = await seeder.checkDatabaseHealth();
      if (!isHealthy) {
        seeder.log('info', '🔄 Database needs seeding...');
        await seeder.seedDatabase();
      }
    }
  } catch (error) {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  } finally {
    await seeder.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { OpportunityZoneSeeder };