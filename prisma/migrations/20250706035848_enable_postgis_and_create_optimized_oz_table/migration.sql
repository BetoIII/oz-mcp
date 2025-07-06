-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create the optimized opportunity zones table
CREATE TABLE "OpportunityZone" (
    "id" TEXT NOT NULL,
    "geoid" TEXT NOT NULL,
    "originalGeom" geometry(MULTIPOLYGON, 4326),
    "simplifiedGeom" geometry(MULTIPOLYGON, 4326),
    "bbox" geometry(POLYGON, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpportunityZone_pkey" PRIMARY KEY ("id")
);

-- Create unique index on geoid
CREATE UNIQUE INDEX "OpportunityZone_geoid_key" ON "OpportunityZone"("geoid");

-- Create spatial indexes for ultra-fast queries
CREATE INDEX "idx_oz_simplified_geom" ON "OpportunityZone" USING GIST ("simplifiedGeom");
CREATE INDEX "idx_oz_bbox" ON "OpportunityZone" USING GIST ("bbox");
CREATE INDEX "OpportunityZone_geoid_idx" ON "OpportunityZone"("geoid");

-- Create a function for two-stage bounding box filtering
CREATE OR REPLACE FUNCTION check_point_in_opportunity_zone(
    input_lat DOUBLE PRECISION,
    input_lon DOUBLE PRECISION
) RETURNS TABLE(
    geoid TEXT,
    is_in_zone BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH candidates AS (
        -- Stage 1: Fast bounding box check
        SELECT oz.geoid, oz.simplifiedGeom
        FROM "OpportunityZone" oz
        WHERE oz.bbox && ST_MakePoint(input_lon, input_lat)
    )
    -- Stage 2: Precise containment check on candidates
    SELECT 
        c.geoid,
        ST_Contains(c.simplifiedGeom, ST_MakePoint(input_lon, input_lat)) as is_in_zone
    FROM candidates c
    WHERE ST_Contains(c.simplifiedGeom, ST_MakePoint(input_lon, input_lat))
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create a faster version using only simplified geometries
CREATE OR REPLACE FUNCTION check_point_in_opportunity_zone_fast(
    input_lat DOUBLE PRECISION,
    input_lon DOUBLE PRECISION
) RETURNS TABLE(
    geoid TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT oz.geoid
    FROM "OpportunityZone" oz
    WHERE oz.simplifiedGeom && ST_MakePoint(input_lon, input_lat)
    AND ST_Contains(oz.simplifiedGeom, ST_MakePoint(input_lon, input_lat))
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to get optimization statistics
CREATE OR REPLACE FUNCTION get_postgis_optimization_stats()
RETURNS TABLE(
    total_zones INTEGER,
    avg_original_vertices INTEGER,
    avg_simplified_vertices INTEGER,
    compression_ratio DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_zones,
        AVG(ST_NPoints(originalGeom))::INTEGER as avg_original_vertices,
        AVG(ST_NPoints(simplifiedGeom))::INTEGER as avg_simplified_vertices,
        (1.0 - AVG(ST_NPoints(simplifiedGeom)::DOUBLE PRECISION / ST_NPoints(originalGeom)::DOUBLE PRECISION)) * 100.0 as compression_ratio
    FROM "OpportunityZone"
    WHERE originalGeom IS NOT NULL AND simplifiedGeom IS NOT NULL;
END;
$$ LANGUAGE plpgsql;