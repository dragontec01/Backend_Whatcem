import app from './app';
import config from './config';
import connectDB from './config/database';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📍 Health check: http://localhost:${config.port}/health`);
      console.log(`📍 API Base URL: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
