const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/images');
    } else if (file.fieldname === 'video') {
      cb(null, 'uploads/videos');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize('filmfeltolto', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

const Film = sequelize.define('Film', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    time: DataTypes.INTEGER,
    category: DataTypes.STRING,
    image: {
      type: DataTypes.STRING,
    },
    video: {
      type: DataTypes.STRING,
    }
  });
  

sequelize.sync();

app.post('/films', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, time, category } = req.body;
    const image = req.files['image']?.[0]?.filename || null;
    const video = req.files['video']?.[0]?.filename || null;

    const film = await Film.create({ title, description, time, category, image, video });
    res.status(201).json(film);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Hibás adatküldés vagy fájlhiba' });
  }
});

app.get('/films', async (req, res) => {
    try {
      const films = await Film.findAll();
      res.json(films);
    } catch (err) {
      console.error('Hiba a filmek lekérdezésekor:', err);
      res.status(500).json({ error: 'Hiba a filmek lekérdezésekor', details: err.message });
    }
  });
  

app.delete('/films/:id', async (req, res) => {
  const deleted = await Film.destroy({ where: { id: req.params.id } });
  res.json({ success: !!deleted });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend fut: http://localhost:${PORT}`);
});
