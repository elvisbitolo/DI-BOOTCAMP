-- Kenyan Markets and Locations Database Schema
-- This extends the existing schema to include all major Kenyan markets

-- Add market locations table
CREATE TABLE IF NOT EXISTS market_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    county VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    coordinates POINT,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert major Kenyan markets
INSERT INTO market_locations (name, county, region, coordinates, description) VALUES
('Nairobi', 'Nairobi', 'Nairobi County', ST_Point(-1.2921, 36.8219), 'Capital city and largest market'),
('Mombasa', 'Mombasa', 'Mombasa County', ST_Point(39.6641, -39.6369), 'Coastal port city'),
('Kisumu', 'Kisumu', 'Kisumu County', ST_Point(-34.7680, 0.0187), 'Western Kenya market hub'),
('Nakuru', 'Nakuru', 'Nakuru County', ST_Point(-36.0617, -0.2913), 'Agricultural center'),
('Eldoret', 'Eldoret', 'Uasin Gishu County', ST_Point(35.9372, 37.3422), 'Industrial town'),
('Thika', 'Thika', 'Kiambu County', ST_Point(-37.0148, 37.2637), 'Industrial satellite town'),
('Kitale', 'Kitale', 'Kitale County', ST_Point(-37.0092, 37.9094), 'Border town'),
('Garissa', 'Garissa', 'Garissa County', ST_Point(-0.4526, 39.6463), 'Northeastern Kenya'),
('Malindi', 'Malindi', 'Kilifi County', ST_Point(3.9485, 40.1030), 'Coastal town'),
('Voi', 'Voi', 'Taita Taveta County', ST_Point(-3.3958, 39.7226), 'Coastal town'),
('Lamu', 'Lamu', 'Lamu County', ST_Point(40.7205, 39.8509), 'Island town'),
('Machakos', 'Machakos', 'Machakos County', ST_Point(-37.7833, 37.8583), 'Coastal town'),
('Busia', 'Busia', 'Busia County', ST_Point(0.4606, 37.8005), 'Western Kenya town'),
('Bungoma', 'Bungoma', 'Bungoma County', ST_Point(-0.9936, 34.6880), 'Western Kenya county'),
('Kakamega', 'Kakamega', 'Kakamega County', ST_Point(-0.9917, 37.1439), 'Western Kenya town'),
('Siaya', 'Siaya', 'Siaya County', ST_Point(0.6061, 34.5251), 'Western Kenya county'),
('Homa Bay', 'Homa Bay', 'Homa Bay County', ST_Point(-0.5176, 34.8641), 'Western Kenya county'),
('Migori', 'Migori', 'Migori County', ST_Point(-0.4832, 38.0677), 'Nyanza region'),
('Kisii', 'Kisii', 'Kisii County', ST_Point(-0.5181, 38.1014), 'Nyanza region'),
('Nyamira', 'Nyamira', 'Nyamira County', ST_Point(-0.5181, 38.1014), 'Nyanza region'),
('Nyandarua', 'Nyandarua', 'Nyandarua County', ST_Point(-0.5583, 38.1014), 'Nyanza region'),
('Kericho', 'Kericho', 'Kericho County', ST_Point(-0.3697, 35.2831), 'Nyanza region'),
('Bomet', 'Bomet', 'Bomet County', ST_Point(-0.7920, 35.5870), 'Rift Valley region'),
('Narok', 'Narok', 'Narok County', ST_Point(-1.0833, 36.8789), 'Rift Valley region'),
('Kajiado', 'Kajiado', 'Kajiado County', ST_Point(-1.1833, 37.0381), 'Rift Valley region'),
('Makueni', 'Makueni', 'Makueni County', ST_Point(-1.8228, 37.0639), 'Rift Valley region'),
('Kitui', 'Kitui', 'Kitui County', ST_Point(-1.0167, 37.0159), 'Rift Valley region'),
('Machakos', 'Machakos', 'Machakos County', ST_Point(-1.5167, 37.2686), 'Eastern region'),
('Embu', 'Embu', 'Embu County', ST_Point(-0.5311, 37.4550), 'Eastern region'),
('Meru', 'Meru', 'Meru County', ST_Point(-0.6436, 37.8472), 'Eastern region'),
('Tharaka Nithi', 'Tharaka Nithi', 'Tharaka Nithi County', ST_Point(-0.9958, 37.1450), 'Eastern region'),
('Embu', 'Embu', 'Embu County', ST_Point(-0.5311, 37.4550), 'Eastern region'),
('Kirinyaga', 'Kirinyaga', 'Kirinyaga County', ST_Point(-0.7892, 37.3589), 'Central region'),
('Muranga', 'Muranga', 'Muranga County', ST_Point(-0.8172, 37.1536), 'Central region'),
('Nyandarua', 'Nyandarua', 'Nyandarua County', ST_Point(-0.5583, 38.1014), 'Central region'),
('Nyeri', 'Nyeri', 'Nyeri County', ST_Point(-0.4181, 37.0189), 'Central region'),
('Kirinyaga', 'Kirinyaga', 'Kirinyaga County', ST_Point(-0.7892, 37.3589), 'Central region');

-- Add indexes for market locations
CREATE INDEX IF NOT EXISTS idx_market_locations_name ON market_locations(name);
CREATE INDEX IF NOT EXISTS idx_market_locations_county ON market_locations(county);
CREATE INDEX IF NOT EXISTS idx_market_locations_region ON market_locations(region);
CREATE INDEX IF NOT EXISTS idx_market_locations_active ON market_locations(is_active);

-- Add market coverage for users
ALTER TABLE users ADD COLUMN IF NOT EXISTS market_coverage VARCHAR(100) DEFAULT 'Nairobi';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Add language preferences
CREATE TABLE IF NOT EXISTS user_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    language_name VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert Kenyan languages
INSERT INTO user_languages (language_code, language_name) VALUES
('en', 'English'),
('sw', 'Kiswahili'),
('lu', 'Luo'),
('kp', 'Kikuyu'),
('ka', 'Kalenjin'),
('kik', 'Kikamba'),
('ki', 'Kikuyu'),
('luo', 'Luo'),
('luhya', 'Luhya'),
('meru', 'Meru'),
('embu', 'Embu'),
('kis', 'Kisii'),
('ny', 'Nyanza'),
('te', 'Teso'),
('turkana', 'Turkana'),
('pokomo', 'Pokomo'),
('mijikenda', 'Mijikenda'),
('tharaka', 'Tharaka'),
('ma', 'Maasai'),
('samburu', 'Samburu'),
('oromo', 'Oromo'),
('de', 'German'),
('ar', 'Arabic'),
('som', 'Somali'),
('fr', 'French');

-- Update user table to include language fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS market_coverage VARCHAR(100) DEFAULT 'Nairobi';

-- Create function to get market by coordinates
CREATE OR REPLACE FUNCTION get_nearest_market(lat FLOAT, lng FLOAT)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    county VARCHAR(100),
    region VARCHAR(100),
    distance_km FLOAT
) AS $$
DECLARE
    nearest_market RECORD;
BEGIN
    SELECT id, name, county, region, coordinates INTO nearest_market
    FROM market_locations
    WHERE is_active = true
    ORDER BY coordinates <-> ST_Point(lat, lng)
    LIMIT 1;
    
    RETURN NEXT nearest_market;
END;
$$ LANGUAGE plpgsql;
