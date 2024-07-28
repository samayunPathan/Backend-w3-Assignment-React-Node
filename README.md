
# Assigment : React-Node.js

This is the backend API for the Hotel Details Application, built with Node.js, Express, and PostgreSQL.
## Overview
This Express.js application serves as the backend for the Hotel Details Application, providing RESTful API endpoints to manage hotel data stored in a PostgreSQL database.


## Features

- Use Node Express js for server creation
- Use a configuration JSON file for credentials, such as DB access and for security.
- Handle status code property with property response/error message (200 for success, 404 for not found, etc.)
- PostgreSQL Database

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL client for Node.js)




## Setup and Installation

Navigate to the backend directory:
`cd w3 react-node-express`

Install dependencies:
`npm install`

Set up the PostgreSQL database:

#### Create a new database
In Database.sql file have table data run in your query to create table.


Running the Server

Start the server:
`npm start`

The server will run on http://localhost:3001 by default

## API Endpoints
#### For hotel : 
- GET /hotels: Retrieve all hotels
- GET /hotels/:slug: Retrieve a specific hotel by slug
- POST /hotels: Create a new hotel
- PUT /hotels/:slug: Update a hotel
- DELETE /hotels/:slug: Delete a hotel

#### For Room :

- GET /hotels/:hotel_slug/rooms: Retrieve all rooms for a hotel
 POST a new room for a hotel with image upload
- POST /hotels/:hotel_slug/rooms:  POST a new room for a hotel with image uploads
- PUT /hotels/:hotel_slug/rooms/:room_slug : Update a room
- DELETE /hotels/:hotel_slug/rooms/:room_slug: Delete a room

## Response:
- 200: Success, returns hotel details.
- 404: Hotel not found.
- 500: Internal server error.

## Error Handling

- Proper exception handling to prevent server crashes
- Appropriate status codes and error messages in API responses

