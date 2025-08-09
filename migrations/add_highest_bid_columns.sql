-- Migration to add highest_bid and highest_bidder columns to auctions table

-- Add columns if they don't exist
DO $$ 
BEGIN
    -- Add highest_bid column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'auctions' AND column_name = 'highest_bid') THEN
        ALTER TABLE auctions ADD COLUMN highest_bid DECIMAL(78, 18) DEFAULT '0'::decimal;
    END IF;
    
    -- Add highest_bidder column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'auctions' AND column_name = 'highest_bidder') THEN
        ALTER TABLE auctions ADD COLUMN highest_bidder VARCHAR(42) DEFAULT '0x0000000000000000000000000000000000000000';
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auctions_highest_bid ON auctions (highest_bid);
CREATE INDEX IF NOT EXISTS idx_auctions_highest_bidder ON auctions (highest_bidder);

-- Add comments for documentation
COMMENT ON COLUMN auctions.highest_bid IS 'Current highest bid amount in ROSE tokens';
COMMENT ON COLUMN auctions.highest_bidder IS 'Address of the current highest bidder';
