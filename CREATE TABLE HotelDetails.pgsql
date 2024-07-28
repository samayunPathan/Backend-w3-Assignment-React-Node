CREATE TABLE HotelDetails (
    slug TEXT PRIMARY KEY,
    images TEXT[], -- Store multiple image paths as array of text
    title TEXT,
    description TEXT,
    guest_count INTEGER,
    bedroom_count INTEGER,
    bathroom_count INTEGER,
    amenities TEXT[],
    host_information TEXT,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL
);