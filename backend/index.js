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
  logging: console.log,
  charset: 'utf8mb4',
  collate: 'utf8mb4_hungarian_ci'
});

const User = require('./models/user')(sequelize);

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'Categories',
  timestamps: false
});

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
    
    await sequelize.sync({ alter: true });
    console.log('Adatbázis és táblák szinkronizálva');
    
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

app.delete('/films/:id', auth(['admin']), async (req, res) => {
  try {
    const film = await Film.findByPk(req.params.id);
    
    if (!film) {
      return res.status(404).json({ error: 'A film nem található!' });
    }

    await film.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Hiba történt a törlés során!' });
  }
});

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Nincs jogosultságod az admin felülethez!' });
  }
  next();
};

app.get('/admin/users', auth(['admin']), async (req, res) => {
  try {
    console.log('Admin users endpoint called');
    console.log('User from auth middleware:', req.user);
    
    await sequelize.authenticate();
    console.log('Database connection is working');

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive'],
      raw: true
    });
    
    console.log('Found users:', users);
    res.json(users);
  } catch (error) {
    console.error('Detailed error in admin/users:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      return res.status(500).json({ 
        error: 'Adatbázis kapcsolati hiba',
        details: error.message
      });
    }
    
    if (error.name === 'SequelizeTableDoesNotExistError') {
      return res.status(500).json({ 
        error: 'A felhasználók tábla nem található',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Hiba a felhasználók lekérdezésekor',
      details: error.message
    });
  }
});

app.get('/admin/films', auth(['admin']), async (req, res) => {
  try {
    const films = await Film.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });
    res.json(films);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a filmek lekérdezésekor' });
  }
});

app.get('/admin/stats', auth(['admin']), async (req, res) => {
  try {
    const [totalUsers, totalFilms] = await Promise.all([
      User.count(),
      Film.count()
    ]);

    const films = await Film.findAll({
      attributes: ['category'],
      group: ['category']
    });

    const categories = films.map(film => ({
      id: film.category,
      name: film.category
    }));

    res.json({
      totalUsers,
      totalFilms,
      totalCategories: categories.length,
      categories
    });
  } catch (error) {
    console.error('Hiba a statisztikák lekérdezésekor:', error);
    res.status(500).json({ error: 'Hiba a statisztikák lekérdezésekor' });
  }
});

app.put('/admin/users/:id/role', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    console.log('Role update attempt:', { userId: id, newRole: role, currentUser: req.user });

    if (!['user', 'moderator', 'admin'].includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({ error: 'Érvénytelen jogosultság!' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ error: 'Felhasználó nem található!' });
    }

    console.log('Found user:', { id: user.id, currentRole: user.role, isSelf: user.id === req.user.id });

    if (user.id === req.user.id && role !== 'admin') {
      console.log('Attempt to remove own admin role');
      return res.status(403).json({ error: 'Nem veheted el saját magadtól az admin jogot!' });
    }

    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      console.log('Admin count:', adminCount);
      if (adminCount <= 1) {
        return res.status(403).json({ error: 'Nem lehet elvenni az utolsó admin jogosultságot!' });
      }
    }

    await user.update({ role });
    console.log('Role updated successfully:', { userId: user.id, newRole: role });
    res.json({ success: true });
  } catch (error) {
    console.error('Hiba a jogosultság módosításakor:', error);
    res.status(500).json({ error: 'Hiba a jogosultság módosításakor: ' + error.message });
  }
});

app.put('/admin/users/:id/toggle', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Felhasználó nem található!' });
    }

    await user.update({ isActive: !user.isActive });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Hiba a felhasználó állapotának módosításakor' });
  }
});

app.post('/admin/categories', auth(['admin']), async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ez a kategória már létezik!' });
    }
    res.status(500).json({ error: 'Hiba a kategória létrehozásakor' });
  }
});

app.delete('/admin/categories/:id', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ error: 'Kategória nem található!' });
    }

    await category.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Hiba a kategória törlésekor' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend fut: http://localhost:${PORT}`);
});
