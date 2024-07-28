CREATE TABLE RoomInformation (
    hotel_slug VARCHAR(255),
    room_slug VARCHAR(255),
    room_image TEXT[],
    room_title VARCHAR(255),
    bedroom_count INT,
    PRIMARY KEY (hotel_slug, room_slug),
    FOREIGN KEY (hotel_slug) REFERENCES HotelDetails(slug) ON DELETE CASCADE
);