const jwt = require('jsonwebtoken');
const db = require('../models');
const helper = require('../helper/helper');
const { User } = db;

// 1. General Authentication Middleware (Sets req.user)
const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return helper.error(res, 'Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decodedToken.id);

      if (!user) {
        return helper.error(res, 'Invalid authentication token', 401);
      }

      // Attach user to request
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
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (decodedToken.role !== 'admin') {
        return helper.error(res, 'Access denied: Admins only', 403);
      }

      const admin = await User.findByPk(decodedToken.id);

      if (!admin || admin.role !== 'admin') {
        return helper.error(res, 'Access denied: Admins only', 403);
      }

      // Attach both admin and user to request for flexibility
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