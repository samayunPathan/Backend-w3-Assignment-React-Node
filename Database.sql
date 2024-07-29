# create database

CREATE DATABASE hotel_info    

 
# create table

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


# create table

CREATE TABLE RoomInformation (     
    hotel_slug VARCHAR(255),
    room_slug VARCHAR(255),
    room_image TEXT[],
    room_title VARCHAR(255),
    bedroom_count INT,
    PRIMARY KEY (hotel_slug, room_slug),
    FOREIGN KEY (hotel_slug) REFERENCES HotelDetails(slug) ON DELETE CASCADE
);
