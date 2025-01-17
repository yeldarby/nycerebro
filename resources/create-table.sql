-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE cameras (
    camera_id    UUID          PRIMARY KEY,
    last_updated TIMESTAMP     NOT NULL DEFAULT '1970-01-01 00:00:00',
    location     GEOGRAPHY(Point, 4326) 
                 NOT NULL 
                 DEFAULT 'SRID=4326;POINT(0 0)'::geography,
    embedding    vector(512)   NOT NULL 
                  DEFAULT array_fill(0::float, ARRAY[512])::vector
);

-- Index for nearest-neighbor on embedding
CREATE INDEX cameras_embedding_idx 
    ON cameras 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Optional spatial index on location, if you need geospatial queries
CREATE INDEX cameras_location_idx 
    ON cameras 
    USING GIST (location);
