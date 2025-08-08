-- Check if tables exist and their structure
-- Run these queries in your Neon database console

-- 1. Check if market_listings table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'market_listings';

-- 2. Check table structure
\d market_listings

-- 3. Check current data count
SELECT COUNT(*) as total_listings FROM market_listings;

-- 4. Check recent listings
SELECT * FROM market_listings ORDER BY created_at DESC LIMIT 5;
