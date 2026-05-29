CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS image_queue (
    id            BIGSERIAL PRIMARY KEY,
    filename      TEXT        NOT NULL UNIQUE,
    bronze_path   TEXT        NOT NULL,
    status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','processing','done','failed')),
    uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_image_queue_status ON image_queue (status);

CREATE TABLE IF NOT EXISTS traffic_sign (
    id                  BIGSERIAL PRIMARY KEY,
    image_queue_id      BIGINT REFERENCES image_queue(id),
    det_id              INT,
    coarse_label        TEXT,
    fine_label          TEXT,
    cosine_similarity   DOUBLE PRECISION,
    confidence_yolo     DOUBLE PRECISION,
    bbox_x1             INT,
    bbox_y1             INT,
    bbox_x2             INT,
    bbox_y2             INT,
    depth_m             DOUBLE PRECISION,
    camera_x_m          DOUBLE PRECISION,
    camera_y_m          DOUBLE PRECISION,
    camera_z_m          DOUBLE PRECISION,
    world_x_m           DOUBLE PRECISION,
    world_y_m           DOUBLE PRECISION,
    world_z_m           DOUBLE PRECISION,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    altitude_m          DOUBLE PRECISION,
    geom                GEOMETRY(Point, 4326),
    source_image        TEXT,
    source_image_abfs   TEXT,
    inferred_at         TIMESTAMPTZ,
    UNIQUE (source_image, det_id)
);

CREATE INDEX IF NOT EXISTS idx_traffic_sign_geom     ON traffic_sign USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_traffic_sign_queue_id ON traffic_sign (image_queue_id);

CREATE TABLE IF NOT EXISTS processing_log (
    id                BIGSERIAL PRIMARY KEY,
    image_queue_id    BIGINT REFERENCES image_queue(id),
    image_filename    TEXT,
    image_abfs        TEXT,
    status            TEXT,
    error_message     TEXT,
    detections_saved  INT,
    started_at        TIMESTAMPTZ,
    finished_at       TIMESTAMPTZ,
    duration_seconds  DOUBLE PRECISION
);

CREATE OR REPLACE FUNCTION set_traffic_sign_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_traffic_sign_geom ON traffic_sign;
CREATE TRIGGER trg_traffic_sign_geom
    BEFORE INSERT OR UPDATE ON traffic_sign
    FOR EACH ROW EXECUTE FUNCTION set_traffic_sign_geom();
