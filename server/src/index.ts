import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection, closePool } from './db/pool.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

// Import routes
import authRoutes from './routes/auth.js';
import conversationsRoutes from './routes/conversations.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await testConnection();
    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      service: 'drama-llm-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'drama-llm-api',
      error: 'Database connection failed',
    });
  }
});

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'Drama LLM API',
    version: '1.0.0',
    description: 'Backend API for Drama LLM with PostgreSQL persistence',
    endpoints: {
      auth: '/api/auth',
      conversations: '/api/conversations',
      health: '/health',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const isConnected = await testConnection();

    if (!isConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    logger.info('Database connection successful');

    // Start listening
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📊 Health check: http://${HOST}:${PORT}/health`);
      logger.info(`📚 API info: http://${HOST}:${PORT}/api`);
      logger.info(`🔐 Auth endpoints: http://${HOST}:${PORT}/api/auth`);
      logger.info(`💬 Conversations: http://${HOST}:${PORT}/api/conversations`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closePool();
          logger.info('Database pool closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
