const jwt = require('jsonwebtoken');
const { User } = require('../models');
const helper = require('../helper/helper');

// 1. General Authentication Middleware (Sets req.user)
const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return helper.error(res, 'Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'fleur_notes_secret_jwt_key_2026');
      const user = await User.findById(decodedToken.id);

      if (!user) {
        return helper.error(res, 'Invalid authentication token', 401);
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return helper.error(res, 'Authentication token has expired', 401);
      }
      return helper.error(res, 'Invalid authentication token', 401);
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return helper.error(res, 'Authentication failed', 500);
  }
};

// 2. Authorization Middleware (Checks if req.user has admin role)
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return helper.error(res, 'Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    return helper.error(res, 'Access denied: Admins only', 403);
  }

  next();
};

// 3. Combined Admin Authentication Middleware (Sets req.admin and req.user)
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return helper.error(res, 'Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'fleur_notes_secret_jwt_key_2026');

      if (decodedToken.role !== 'admin') {
        return helper.error(res, 'Access denied: Admins only', 403);
      }

      const admin = await User.findById(decodedToken.id);

      if (!admin || admin.role !== 'admin') {
        return helper.error(res, 'Access denied: Admins only', 403);
      }

      req.admin = admin;
      req.user = admin;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return helper.error(res, 'Authentication token has expired', 401);
      }
      return helper.error(res, 'Invalid authentication token', 401);
    }
  } catch (error) {
    console.error('Admin authentication middleware error:', error);
    return helper.error(res, 'Authentication failed', 500);
  }
};

module.exports = {
  authentication,
  isAdmin,
  authenticateAdmin
};