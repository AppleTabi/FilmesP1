const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Hozzáférés megtagadva. Kérlek jelentkezz be!' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Nincs jogosultságod ehhez a művelethez!' });
      }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Érvénytelen token!' });
    }
  };
};

module.exports = auth; 