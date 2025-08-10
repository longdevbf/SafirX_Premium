
CREATE TABLE IF NOT EXISTS sync_status (
    id SERIAL PRIMARY KEY,
    service VARCHAR(50) UNIQUE NOT NULL, -- 'auction' or 'market'
    last_synced_block BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint to ensure only one record per service (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_service') THEN
        ALTER TABLE sync_status ADD CONSTRAINT unique_service UNIQUE (service);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sync_status_service ON sync_status (service);
CREATE INDEX IF NOT EXISTS idx_sync_status_updated_at ON sync_status (updated_at);

-- Insert initial records for auction and market services
INSERT INTO sync_status (service, last_synced_block, created_at) 
VALUES ('auction', 0, NOW()), ('market', 0, NOW())
ON CONFLICT (service) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE sync_status IS 'Tracks the last synchronized block number for each blockchain listener service';
COMMENT ON COLUMN sync_status.service IS 'The service name: auction or market';
COMMENT ON COLUMN sync_status.last_synced_block IS 'The last block number that was successfully synchronized';
COMMENT ON COLUMN sync_status.created_at IS 'When this service sync tracking was first created';
COMMENT ON COLUMN sync_status.updated_at IS 'When the last_synced_block was last updated';
