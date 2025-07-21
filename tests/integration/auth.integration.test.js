const request = require('supertest');
const express = require('express');
const { setupAuthRoutes } = require('../../server/auth');
const database = require('../../server/database');

describe('Auth API Integration Tests', () => {
  let app;
  let authService;

  beforeAll(async () => {
    // Initialize database
    await database.connect();
    await database.init();
  });

  beforeEach(async () => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    
    // Setup auth routes
    authService = setupAuthRoutes(app);
    
    // Clear users table before each test
    await database.db.run('DELETE FROM users');
  });

  afterAll(async () => {
    await database.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with existing username', async () => {
      const userData = {
        username: 'existinguser',
        email: 'user1@example.com',
        password: 'password123',
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          email: 'different@example.com',
        })
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          // missing email and password
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123', // too short
        })
        .expect(400);

      expect(response.body.error).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });

    it('should not login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('POST /api/auth/guest', () => {
    it('should create a guest session', async () => {
      const response = await request(app)
        .post('/api/auth/guest')
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.isGuest).toBe(true);
      expect(response.body.user.username).toBe('Guest');
    });

    it('should create unique guest IDs', async () => {
      const response1 = await request(app)
        .post('/api/auth/guest')
        .expect(200);

      const response2 = await request(app)
        .post('/api/auth/guest')
        .expect(200);

      expect(response1.body.user.id).not.toBe(response2.body.user.id);
    });
  });

  describe('GET /api/auth/verify', () => {
    let validToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      
      validToken = response.body.token;
    });

    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(403);

      expect(response.body.error).toContain('Invalid token');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });
  });
});