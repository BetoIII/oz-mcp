const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const crypto = require('crypto');

class OpportunityZonePreprocessor {
  constructor() {
    this.OZ_DATA_URL = process.env.OZ_DATA_URL || 'https://pub-757ceba6f52a4399beb76c4667a53f08.r2.dev/oz-all.geojson';
    this.OUTPUT_DIR = path.join(__dirname, '..', 'data');
    this.PROCESSED_FILE = path.join(this.OUTPUT_DIR, 'opportunity-zones-optimized.json');
    this.METADATA_FILE = path.join(this.OUTPUT_DIR, 'opportunity-zones-metadata.json');
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  async ensureOutputDirectory() {
    try {
      await fs.access(this.OUTPUT_DIR);
    } catch {
      await fs.mkdir(this.OUTPUT_DIR, { recursive: true });
      this.log('info', `📁 Created output directory: ${this.OUTPUT_DIR}`);
    }
  }

  async downloadRawData() {
    this.log('info', `🔗 Downloading raw data from: ${this.OZ_DATA_URL}`);
    
    const response = await fetch(this.OZ_DATA_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'OZ-MCP-Preprocessor/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.features?.length) {
      throw new Error('Invalid GeoJSON format: missing features array');
    }

    this.log('info', `📊 Downloaded ${data.features.length} features (${JSON.stringify(data).length} bytes)`);
    
    return data;
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

  simplifyCoordinates(coordinates, tolerance = 0.0001) {
    // Douglas-Peucker algorithm for line simplification
    const douglasPeucker = (points, tolerance) => {
      if (points.length <= 2) return points;

      const distanceToLine = (point, lineStart, lineEnd) => {
        const A = lineEnd[0] - lineStart[0];
        const B = lineEnd[1] - lineStart[1];
        const C = point[0] - lineStart[0];
        const D = point[1] - lineStart[1];
        
        const dot = A * C + B * D;
        const lenSquared = A * A + B * B;
        
        if (lenSquared === 0) return Math.sqrt(C * C + D * D);
        
        const param = dot / lenSquared;
        let xx, yy;
        
        if (param < 0) {
          xx = lineStart[0];
          yy = lineStart[1];
        } else if (param > 1) {
          xx = lineEnd[0];
          yy = lineEnd[1];
        } else {
          xx = lineStart[0] + param * A;
          yy = lineStart[1] + param * B;
        }
        
        const dx = point[0] - xx;
        const dy = point[1] - yy;
        return Math.sqrt(dx * dx + dy * dy);
      };

      let maxDistance = 0;
      let maxIndex = 0;
      
      for (let i = 1; i < points.length - 1; i++) {
        const distance = distanceToLine(points[i], points[0], points[points.length - 1]);
        if (distance > maxDistance) {
          maxDistance = distance;
          maxIndex = i;
        }
      }
      
      if (maxDistance > tolerance) {
        const left = douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
        const right = douglasPeucker(points.slice(maxIndex), tolerance);
        return [...left.slice(0, -1), ...right];
      }
      
      return [points[0], points[points.length - 1]];
    };

    return douglasPeucker(coordinates, tolerance);
  }

  optimizeGeometry(geometry) {
    const optimized = { ...geometry };

    if (geometry.type === 'Polygon') {
      optimized.coordinates = geometry.coordinates.map(ring => 
        this.simplifyCoordinates(ring)
      );
    } else if (geometry.type === 'MultiPolygon') {
      optimized.coordinates = geometry.coordinates.map(polygon =>
        polygon.map(ring => this.simplifyCoordinates(ring))
      );
    }

    return optimized;
  }

  processFeatures(geoJson) {
    this.log('info', `🔧 Processing ${geoJson.features.length} features...`);
    
    const processedFeatures = [];
    const spatialIndex = [];
    let originalSize = 0;
    let processedSize = 0;

    for (let i = 0; i < geoJson.features.length; i++) {
      const feature = geoJson.features[i];
      const originalFeatureSize = JSON.stringify(feature).length;
      originalSize += originalFeatureSize;

      // Optimize the feature
      const optimizedFeature = {
        type: 'Feature',
        geometry: this.optimizeGeometry(feature.geometry),
        properties: {
          GEOID: feature.properties?.GEOID || feature.properties?.CENSUSTRAC || `OZ_${i}`
        }
      };

      // Calculate bounding box
      const bbox = this.calculateBBox(optimizedFeature.geometry);
      
      // Store spatial index entry
      spatialIndex.push({
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        index: i,
        geoid: optimizedFeature.properties.GEOID
      });

      processedFeatures.push(optimizedFeature);
      processedSize += JSON.stringify(optimizedFeature).length;

      if (i % 1000 === 0) {
        this.log('info', `🔄 Processed ${i}/${geoJson.features.length} features`);
      }
    }

    const compressionRatio = ((originalSize - processedSize) / originalSize * 100).toFixed(1);
    this.log('info', `📦 Compression: ${originalSize} → ${processedSize} bytes (${compressionRatio}% reduction)`);

    return {
      features: processedFeatures,
      spatialIndex,
      stats: {
        originalSize,
        processedSize,
        compressionRatio: parseFloat(compressionRatio),
        featureCount: processedFeatures.length
      }
    };
  }

  async calculateHash(data) {
    const jsonString = JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
    return hash;
  }

  async saveProcessedData(processedData) {
    await this.ensureOutputDirectory();

    const optimizedGeoJson = {
      type: 'FeatureCollection',
      features: processedData.features
    };

    const metadata = {
      version: new Date().toISOString(),
      dataHash: await this.calculateHash(optimizedGeoJson),
      stats: processedData.stats,
      spatialIndex: processedData.spatialIndex,
      sourceUrl: this.OZ_DATA_URL,
      processedAt: new Date().toISOString()
    };

    // Save optimized GeoJSON
    await fs.writeFile(this.PROCESSED_FILE, JSON.stringify(optimizedGeoJson, null, 2));
    this.log('info', `💾 Saved optimized GeoJSON to: ${this.PROCESSED_FILE}`);

    // Save metadata
    await fs.writeFile(this.METADATA_FILE, JSON.stringify(metadata, null, 2));
    this.log('info', `💾 Saved metadata to: ${this.METADATA_FILE}`);

    return metadata;
  }

  async checkExistingData() {
    try {
      const [geoJsonStat, metadataStat] = await Promise.all([
        fs.stat(this.PROCESSED_FILE),
        fs.stat(this.METADATA_FILE)
      ]);

      const metadata = JSON.parse(await fs.readFile(this.METADATA_FILE, 'utf8'));
      
      // Check if data is less than 24 hours old
      const age = Date.now() - new Date(metadata.processedAt).getTime();
      const hoursOld = age / (1000 * 60 * 60);

      if (hoursOld < 24) {
        this.log('info', `📦 Found existing processed data (${hoursOld.toFixed(1)} hours old)`);
        return metadata;
      } else {
        this.log('info', `⏰ Existing data is ${hoursOld.toFixed(1)} hours old, will refresh`);
        return null;
      }
    } catch (error) {
      this.log('info', '📦 No existing processed data found');
      return null;
    }
  }

  async process(force = false) {
    try {
      this.log('info', '🚀 Starting data preprocessing...');

      // Check for existing data
      if (!force) {
        const existingMetadata = await this.checkExistingData();
        if (existingMetadata) {
          this.log('info', '✅ Using existing processed data');
          return existingMetadata;
        }
      }

      // Download raw data
      const rawData = await this.downloadRawData();

      // Process the data
      const processedData = await this.processFeatures(rawData);

      // Save processed data
      const metadata = await this.saveProcessedData(processedData);

      this.log('success', `✅ Data preprocessing complete!`);
      this.log('info', `📊 Stats: ${metadata.stats.featureCount} features, ${metadata.stats.compressionRatio}% compression`);

      return metadata;
    } catch (error) {
      this.log('error', `❌ Data preprocessing failed: ${error.message}`);
      throw error;
    }
  }

  async getProcessedData() {
    const [geoJson, metadata] = await Promise.all([
      fs.readFile(this.PROCESSED_FILE, 'utf8').then(JSON.parse),
      fs.readFile(this.METADATA_FILE, 'utf8').then(JSON.parse)
    ]);

    return { geoJson, metadata };
  }
}

// Main execution
async function main() {
  const preprocessor = new OpportunityZonePreprocessor();
  
  try {
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    
    if (args.includes('--check')) {
      await preprocessor.checkExistingData();
    } else {
      await preprocessor.process(force);
    }
  } catch (error) {
    console.error('❌ Preprocessing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { OpportunityZonePreprocessor };