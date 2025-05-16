const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth.js');
const fs = require('fs');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

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

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Csak képfájlokat lehet feltölteni!'), false);
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return cb(new Error('A képfájl mérete nem lehet nagyobb mint 5MB!'), false);
    }
  }
  
  if (file.fieldname === 'video') {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Csak videófájlokat lehet feltölteni!'), false);
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return cb(new Error('A videófájl mérete nem lehet nagyobb mint 100MB!'), false);
    }
  }
  
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize('filmfeltolto', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_hungarian_ci'
});

const User = require('./models/user')(sequelize);

const Film = sequelize.define('Film', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  time: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  video: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Films',
  timestamps: false
});

Film.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Film, { foreignKey: 'userId' });

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL kapcsolat sikeres');
    
    await sequelize.sync({ force: true });
    console.log('Adatbázis és táblák létrehozva');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const imagesDir = path.join(uploadsDir, 'images');
    const videosDir = path.join(uploadsDir, 'videos');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
    }
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir);
    }
    
    console.log('Upload mappák létrehozva');
  } catch (error) {
    console.error('Hiba az adatbázis inicializálásakor:', error);
    process.exit(1);
  }
};

initDatabase();

app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userCount = await User.count();
    const role = userCount === 0 ? 'admin' : 'user';
    const user = await User.create({ email, password, name, role });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    res.status(400).json({ error: 'Regisztráció sikertelen: ' + error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Hibás email vagy jelszó!' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    res.status(400).json({ error: 'Bejelentkezés sikertelen: ' + error.message });
  }
});

app.post('/films', auth(['user', 'moderator', 'admin']), upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, time, category } = req.body;
    const image = req.files['image']?.[0]?.filename || null;
    const video = req.files['video']?.[0]?.filename || null;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(400).json({ error: 'A felhasználó nem található. Kérjük, jelentkezz be újra!' });
    }

    const film = await Film.create({
      title,
      description,
      time,
      category,
      image,
      video,
      userId: req.user.id
    });

    res.status(201).json(film);
  } catch (err) {
    console.error('Film feltöltési hiba:', err);
    
    let errorMessage = 'Hiba történt a film feltöltésekor. ';
    
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      errorMessage += 'A felhasználó nem található. Kérjük, jelentkezz be újra!';
    } else if (err.name === 'SequelizeValidationError') {
      errorMessage += 'Kérjük, ellenőrizd a megadott adatokat!';
    } else {
      errorMessage += err.message || 'Ismeretlen hiba történt.';
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

app.get('/films', async (req, res) => {
  try {
    const films = await Film.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });
    res.json(films);
  } catch (err) {
    console.error('Hiba a filmek lekérdezésekor:', err);
    res.status(500).json({ error: 'Hiba a filmek lekérdezésekor', details: err.message });
  }
});

app.delete('/films/:id', auth(['moderator', 'admin']), async (req, res) => {
  try {
    const film = await Film.findByPk(req.params.id);
    
    if (!film) {
      return res.status(404).json({ error: 'A film nem található!' });
    }

    if (req.user.role !== 'admin' && film.userId !== req.user.id) {
      return res.status(403).json({ error: 'Nincs jogosultságod törölni ezt a filmet!' });
    }

    await film.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Hiba történt a törlés során!' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend fut: http://localhost:${PORT}`);
});
