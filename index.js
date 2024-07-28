const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("./config.json"); 

const app = express();
app.use(bodyParser.json());
app.use(express.json());
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:3000", // Replace with your frontend's origin
};

app.use(cors(corsOptions));
app.use(cors());

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// const upload = multer({ storage: storage });
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


function sendResponse(res, statusCode, message, data = null) {
  const response = {
    status: statusCode,
    message: message,
    data: data,
  };
  res.status(statusCode).json(response);
}

// GET all hotels
app.get("/hotels", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM HotelDetails");
    sendResponse(res, 200, "Hotels retrieved successfully", result.rows);
  } catch (err) {
    sendResponse(res, 500, "Error retrieving hotels", { error: err.message });
  }
});

// GET a specific hotel
app.get("/hotels/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      "SELECT * FROM HotelDetails WHERE slug = $1",
      [slug]
    );
    if (result.rows.length === 0) {
      return sendResponse(res, 404, "Hotel not found");
    }
    sendResponse(res, 200, "Hotel retrieved successfully", result.rows[0]);
  } catch (err) {
    sendResponse(res, 500, "Error retrieving hotel", { error: err.message });
  }
});

// POST a new hotel with image upload
app.post("/hotels", upload.array("images", 5), async (req, res) => {
  try {
    const {
      slug,
      title,
      description,
      guest_count,
      bedroom_count,
      bathroom_count,
      amenities,
      host_information,
      address,
      latitude,
      longitude,
    } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => "/uploads/" + file.filename);
    } else {
      const currentHotel = await pool.query(
        "SELECT images FROM HotelDetails WHERE slug = $1",
        [slug]
      );
      images = currentHotel.rows[0].images;
    }

    const result = await pool.query(
      "INSERT INTO HotelDetails (slug, images, title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      [
        slug,
        images,
        title,
        description,
        guest_count,
        bedroom_count,
        bathroom_count,
        amenities,
        host_information,
        address,
        latitude,
        longitude,
      ]
    );
    sendResponse(res, 201, "Hotel created successfully", result.rows[0]);
  } catch (err) {
    sendResponse(res, 500, "Error creating hotel", { error: err.message });
  }
});

// UPDATE a hotel with image upload
app.put("/hotels/:slug", upload.array("images", 5), async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      title,
      description,
      guest_count,
      bedroom_count,
      bathroom_count,
      amenities,
      host_information,
      address,
      latitude,
      longitude,
    } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => "/uploads/" + file.filename);
    } else {
      const currentHotel = await pool.query(
        "SELECT images FROM HotelDetails WHERE slug = $1",
        [slug]
      );
      images = currentHotel.rows[0].images;
    }

    const result = await pool.query(
      "UPDATE HotelDetails SET images = $1, title = $2, description = $3, guest_count = $4, bedroom_count = $5, bathroom_count = $6, amenities = $7, host_information = $8, address = $9, latitude = $10, longitude = $11 WHERE slug = $12 RETURNING *",
      [
        images,
        title,
        description,
        guest_count,
        bedroom_count,
        bathroom_count,
        amenities,
        host_information,
        address,
        latitude,
        longitude,
        slug,
      ]
    );
    if (result.rows.length === 0) {
      return sendResponse(res, 404, "Hotel not found");
    }
    sendResponse(res, 200, "Hotel updated successfully", result.rows[0]);
  } catch (err) {
    sendResponse(res, 500, "Error updating hotel", { error: err.message });
  }
});

// DELETE a hotel
app.delete("/hotels/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      "DELETE FROM HotelDetails WHERE slug = $1 RETURNING *",
      [slug]
    );
    if (result.rows.length === 0) {
      return sendResponse(res, 404, "Hotel not found");
    }
    // Delete associated image files
    result.rows[0].images.forEach((imagePath) => {
      fs.unlink(path.join(__dirname, imagePath), (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });

    sendResponse(res, 200, "Hotel deleted successfully");
  } catch (err) {
    sendResponse(res, 500, "Error deleting hotel", { error: err.message });
  }
});

// ----- room ----

// GET all rooms for a hotel
app.get("/hotels/:hotel_slug/rooms", async (req, res) => {
  try {
    const { hotel_slug } = req.params;
    const result = await pool.query(
      "SELECT * FROM RoomInformation WHERE hotel_slug = $1",
      [hotel_slug]
    );
    sendResponse(res, 200, "Rooms retrieved successfully", result.rows);
  } catch (err) {
    sendResponse(res, 500, "Error retrieving rooms", { error: err.message });
  }
});

// POST a new room for a hotel with image upload
app.post(
  "/hotels/:hotel_slug/rooms",
  upload.array("room_image"),
  async (req, res) => {
    try {
      const { hotel_slug } = req.params;
      const { room_slug, room_title, bedroom_count } = req.body;
      let room_image = [];
      if (req.files && req.files.length > 0) {
        room_image = req.files.map((file) => "/uploads/" + file.filename);
      }

      const result = await pool.query(
        "INSERT INTO RoomInformation (hotel_slug, room_slug, room_image, room_title, bedroom_count) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [hotel_slug, room_slug, room_image, room_title, bedroom_count]
      );
      sendResponse(res, 201, "Room created successfully", result.rows[0]);
    } catch (err) {
      sendResponse(res, 500, "Error creating room", { error: err.message });
    }
  }
);

// UPDATE a room with image upload
app.put(
  "/hotels/:hotel_slug/rooms/:room_slug",
  upload.single("room_image"),
  async (req, res) => {
    try {
      const { hotel_slug, room_slug } = req.params;
      const { room_title, bedroom_count } = req.body;

      let room_image;
      if (req.file) {
        room_image = "/uploads/" + req.file.filename;
      } else {
        const currentRoom = await pool.query(
          "SELECT room_image FROM RoomInformation WHERE hotel_slug = $1 AND room_slug = $2",
          [hotel_slug, room_slug]
        );
        room_image = currentRoom.rows[0].room_image;
      }

      const result = await pool.query(
        "UPDATE RoomInformation SET room_image = $1, room_title = $2, bedroom_count = $3 WHERE hotel_slug = $4 AND room_slug = $5 RETURNING *",
        [room_image, room_title, bedroom_count, hotel_slug, room_slug]
      );
      if (result.rows.length === 0) {
        return sendResponse(res, 404, "Room not found");
      }
      sendResponse(res, 200, "Room updated successfully", result.rows[0]);
    } catch (err) {
      sendResponse(res, 500, "Error updating room", { error: err.message });
    }
  }
);

// DELETE a room
app.delete("/hotels/:hotel_slug/rooms/:room_slug", async (req, res) => {
  try {
    const { hotel_slug, room_slug } = req.params;
    const result = await pool.query(
      "DELETE FROM RoomInformation WHERE hotel_slug = $1 AND room_slug = $2 RETURNING *",
      [hotel_slug, room_slug]
    );
    if (result.rows.length === 0) {
      return sendResponse(res, 404, "Room not found");
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }
    // Delete associated image file
    if (result.rows[0].room_image) {
      fs.unlink(path.join(__dirname, result.rows[0].room_image), (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    sendResponse(res, 200, "Room deleted successfully");
  } catch (err) {
    sendResponse(res, 500, "Error deleting room", { error: err.message });
  }
});
