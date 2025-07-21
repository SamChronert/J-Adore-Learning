const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthService } = require('../../server/auth');

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should create different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);
      
      const result = await authService.comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await bcrypt.hash(password, 10);
      
      const result = await authService.comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = { id: 1, username: 'testuser' };
      const token = authService.generateToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(user.id);
      expect(decoded.username).toBe(user.username);
    });

    it('should include expiration time', () => {
      const user = { id: 1, username: 'testuser' };
      const token = authService.generateToken(user);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('generateGuestToken', () => {
    it('should generate a guest token with isGuest flag', () => {
      const token = authService.generateGuestToken();
      
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.isGuest).toBe(true);
      expect(decoded.userId).toMatch(/^guest_/);
    });

    it('should have shorter expiration for guest tokens', () => {
      const token = authService.generateGuestToken();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const expirationTime = decoded.exp - decoded.iat;
      const expectedTime = parseInt(process.env.GUEST_SESSION_EXPIRE_HOURS) * 3600;
      
      expect(expirationTime).toBe(expectedTime);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const user = { id: 1, username: 'testuser' };
      const token = authService.generateToken(user);
      
      const decoded = authService.verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(user.id);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        authService.verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create an expired token
      const payload = {
        userId: 1,
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET);
      
      expect(() => {
        authService.verifyToken(expiredToken);
      }).toThrow();
    });
  });

  describe('authenticateToken middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should call next() with valid token', () => {
      const user = { id: 1, username: 'testuser' };
      const token = authService.generateToken(user);
      req.headers.authorization = `Bearer ${token}`;
      
      authService.authenticateToken(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(user.id);
    });

    it('should return 401 without authorization header', () => {
      authService.authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 with invalid token', () => {
      req.headers.authorization = 'Bearer invalid.token';
      
      authService.authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});