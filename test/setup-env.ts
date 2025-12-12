import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load test-specific env file if present, else fallback
const envPath = resolve(process.cwd(), '.env.test');
dotenv.config({ path: envPath });

// Sensible fallbacks for tests if variables missing
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '3001';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_please_change';

// Default local DB url if not provided
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/mbands_test';

// Frontend URL default
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';