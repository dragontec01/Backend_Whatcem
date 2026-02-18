import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  mongodbUser: string;
  mongodbPassword: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dtechcxdb',
  mongodbUser: process.env.MONGODB_USER || '',
  mongodbPassword: process.env.MONGODB_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

export default config;
