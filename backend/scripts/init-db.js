#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run this script to initialize the database schema
 */

require('dotenv').config();
const { initDatabase, closeDatabase } = require('../database');

console.log('🔧 Initializing database...');
console.log('');

try {
  initDatabase();
  console.log('');
  console.log('✅ Database initialization complete!');
  console.log(`📁 Database file: ${process.env.DB_PATH || './data/pet.db'}`);
  console.log('');
  closeDatabase();
  process.exit(0);
} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
}
