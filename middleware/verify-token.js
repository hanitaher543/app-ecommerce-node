const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const header = req.headers['authorization'];
  const token = header && header.split('Bearer ')[1];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'No token provided',
    });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
      });
    }

    req.user = {
      id: decoded.iduser,
      role: decoded.role,
    };

    next();
  });
};

module.exports = { verifyToken };
