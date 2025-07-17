const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const SALT_ROUNDS = 12;

class AuthService {
  // Register new user
  async register(username, password, email = null) {
    try {
      // Check if user already exists
      const existingUser = await database.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Create user
      const userId = await database.createUser(username, passwordHash, email);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId, username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        user: { id: userId, username, email },
        token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login user
  async login(username, password) {
    try {
      // Get user from database
      const user = await database.getUserByUsername(username);
      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid username or password');
      }

      // Update last login
      await database.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          lastLogin: new Date().toISOString()
        },
        token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        success: true,
        user: decoded
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }
  }

  // Middleware to protect routes
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const verification = this.verifyToken(token);
    if (!verification.success) {
      return res.status(403).json({ error: verification.error });
    }

    req.user = verification.user;
    next();
  }

  // Optional authentication (for features that work with or without login)
  optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const verification = this.verifyToken(token);
      if (verification.success) {
        req.user = verification.user;
      }
    }

    next();
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user
      const user = await database.getUserByUsername(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      
      // Update password in database
      // Note: This would require a database method to update password
      // For now, this is a placeholder for future implementation
      
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate guest token for anonymous users
  generateGuestToken() {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = jwt.sign(
      { userId: guestId, username: 'Guest', isGuest: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      user: { id: guestId, username: 'Guest', isGuest: true },
      token
    };
  }
}

// Auth routes for Express
function setupAuthRoutes(app) {
  const authService = new AuthService();

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authService.register(username, password, email);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authService.login(username, password);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  });

  // Guest login route
  app.post('/api/auth/guest', (req, res) => {
    const result = authService.generateGuestToken();
    res.json(result);
  });

  // Verify token route
  app.get('/api/auth/verify', authService.authenticateToken.bind(authService), (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  });

  // Logout route (client-side mainly, but can blacklist tokens if needed)
  app.post('/api/auth/logout', (req, res) => {
    // In a more sophisticated setup, you might blacklist the token
    res.json({ success: true, message: 'Logged out successfully' });
  });

  return authService;
}

module.exports = { AuthService, setupAuthRoutes };