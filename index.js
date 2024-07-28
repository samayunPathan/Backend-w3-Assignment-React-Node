const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
app.use(bodyParser.json());
app.use(express.json());
const cors = require('cors');



const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend's origin
};

app.use(cors(corsOptions)); 
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hotel_info',
  password: '1234',
  port: 5432,
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// const upload = multer({ storage: storage });
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// GET all hotels
app.get('/hotels', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM HotelDetails');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a specific hotel
app.get('/hotels/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM HotelDetails WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new hotel with image upload
app.post('/hotels', upload.array('images', 5), async (req, res) => {
  try {
    // const { slug,title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude } = req.body;
    // const images = req.files.map(file => '/uploads/' + file.filename);
      const { slug, title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude } = req.body;
      let images = [];
      if (req.files && req.files.length > 0) {
        images = req.files.map(file => '/uploads/' + file.filename);}
    
    console.log(res.body)
    const result = await pool.query(
      'INSERT INTO HotelDetails (slug, images, title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [slug, images, title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a hotel with image upload
app.put('/hotels/:slug', upload.array('images', 5), async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => '/uploads/' + file.filename);
    } else {
      const currentHotel = await pool.query('SELECT images FROM HotelDetails WHERE slug = $1', [slug]);
      images = currentHotel.rows[0].images;
    }

    const result = await pool.query(
      'UPDATE HotelDetails SET images = $1, title = $2, description = $3, guest_count = $4, bedroom_count = $5, bathroom_count = $6, amenities = $7, host_information = $8, address = $9, latitude = $10, longitude = $11 WHERE slug = $12 RETURNING *',
      [images, title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude, slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a hotel
app.delete('/hotels/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('DELETE FROM HotelDetails WHERE slug = $1 RETURNING *', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    // Delete associated image files
    result.rows[0].images.forEach(imagePath => {
      fs.unlink(path.join(__dirname, imagePath), (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// ---- room ----- 




// GET all rooms for a hotel
app.get('/hotels/:hotel_slug/rooms', async (req, res) => {
  try {
    const { hotel_slug } = req.params;
    const result = await pool.query('SELECT * FROM RoomInformation WHERE hotel_slug = $1', [hotel_slug]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new room for a hotel with image upload
app.post('/hotels/:hotel_slug/rooms', upload.array('room_image'), async (req, res) => {
  try {
    const { hotel_slug } = req.params;
    const { room_slug, room_title, bedroom_count } = req.body;
    let room_image = [];
      if (req.files && req.files.length > 0) {
        room_image = req.files.map(file => '/uploads/' + file.filename);}
    
    const result = await pool.query(
      'INSERT INTO RoomInformation (hotel_slug, room_slug, room_image, room_title, bedroom_count) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [hotel_slug, room_slug, room_image, room_title, bedroom_count]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a room with image upload
app.put('/hotels/:hotel_slug/rooms/:room_slug', upload.single('room_image'), async (req, res) => {
  try {
    const { hotel_slug, room_slug } = req.params;
    const { room_title, bedroom_count } = req.body;
    
    let room_image;
    if (req.file) {
      room_image = '/uploads/' + req.file.filename;
    } else {
      const currentRoom = await pool.query('SELECT room_image FROM RoomInformation WHERE hotel_slug = $1 AND room_slug = $2', [hotel_slug, room_slug]);
      room_image = currentRoom.rows[0].room_image;
    }

    const result = await pool.query(
      'UPDATE RoomInformation SET room_image = $1, room_title = $2, bedroom_count = $3 WHERE hotel_slug = $4 AND room_slug = $5 RETURNING *',
      [room_image, room_title, bedroom_count, hotel_slug, room_slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a room
app.delete('/hotels/:hotel_slug/rooms/:room_slug', async (req, res) => {
  try {
    const { hotel_slug, room_slug } = req.params;
    const result = await pool.query('DELETE FROM RoomInformation WHERE hotel_slug = $1 AND room_slug = $2 RETURNING *', [hotel_slug, room_slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    // Delete associated image file
    if (result.rows[0].room_image) {
      fs.unlink(path.join(__dirname, result.rows[0].room_image), (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

