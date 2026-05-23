const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dbDir = path.dirname(process.env.DB_PATH || './data/pet.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || './data/pet.db';
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 */
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pets (
      user_id TEXT PRIMARY KEY,
      name TEXT DEFAULT '小猫咪',
      hunger INTEGER DEFAULT 80 CHECK(hunger >= 0 AND hunger <= 100),
      happiness INTEGER DEFAULT 80 CHECK(happiness >= 0 AND happiness <= 100),
      intimacy INTEGER DEFAULT 50 CHECK(intimacy >= 0 AND intimacy <= 100),
      mood TEXT DEFAULT 'happy' CHECK(mood IN ('happy', 'sad', 'angry', 'sleepy')),
      last_fed DATETIME,
      last_happy DATETIME,
      last_intimate DATETIME,
      last_pet DATETIME,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at);
    CREATE INDEX IF NOT EXISTS idx_pets_mood ON pets(mood);
  `);

  console.log('✅ Database initialized successfully');
}

/**
 * Create a new pet for a user
 * @param {string} userId - User ID
 * @param {string} name - Pet name (optional)
 * @returns {object} Created pet data
 */
function createPet(userId, name = '小猫咪') {
  const stmt = db.prepare(`
    INSERT INTO pets (user_id, name, last_fed, last_happy, last_intimate, last_pet)
    VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  try {
    stmt.run(userId, name);
    return getPetById(userId);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      throw new Error('Pet already exists for this user');
    }
    throw error;
  }
}

/**
 * Get pet by user ID
 * @param {string} userId - User ID
 * @returns {object|null} Pet data or null
 */
function getPetById(userId) {
  const stmt = db.prepare('SELECT * FROM pets WHERE user_id = ?');
  const pet = stmt.get(userId);

  if (pet) {
    // Calculate mood based on stats
    pet.mood = calculateMood(pet);
  }

  return pet;
}

/**
 * Calculate pet mood based on stats
 * @param {object} pet - Pet data
 * @returns {string} Mood status
 */
function calculateMood(pet) {
  // Hunger at 0 makes pet unhappy
  if (pet.hunger === 0) {
    return 'sad';
  }
  
  // Low happiness
  if (pet.happiness < 20) {
    return 'sad';
  }
  
  // Very high happiness
  if (pet.happiness > 80) {
    return 'happy';
  }
  
  // Low intimacy
  if (pet.intimacy < 20) {
    return 'angry';
  }
  
  // Default happy
  return 'happy';
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Update pet stats
 * @param {string} userId - User ID
 * @param {object} updates - Stats to update
 * @returns {object|null} Updated pet data
 */
function updatePetStats(userId, updates) {
  const pet = getPetById(userId);
  if (!pet) {
    return null;
  }

  const fields = [];
  const values = [];

  if (updates.hunger !== undefined) {
    fields.push('hunger = ?');
    values.push(clamp(updates.hunger));
    fields.push('last_fed = CURRENT_TIMESTAMP');
  }

  if (updates.happiness !== undefined) {
    fields.push('happiness = ?');
    values.push(clamp(updates.happiness));
    fields.push('last_happy = CURRENT_TIMESTAMP');
  }

  if (updates.intimacy !== undefined) {
    fields.push('intimacy = ?');
    values.push(clamp(updates.intimacy));
    fields.push('last_intimate = CURRENT_TIMESTAMP');
  }

  if (updates.mood !== undefined) {
    fields.push('mood = ?');
    values.push(updates.mood);
  }

  fields.push('last_updated = CURRENT_TIMESTAMP');
  values.push(userId);

  const stmt = db.prepare(`
    UPDATE pets 
    SET ${fields.join(', ')}
    WHERE user_id = ?
  `);

  stmt.run(...values);
  return getPetById(userId);
}

/**
 * Feed the pet
 * @param {string} userId - User ID
 * @param {number} amount - Amount to feed (default 15)
 * @returns {object|null} Updated pet data
 */
function feedPet(userId, amount = 15) {
  const pet = getPetById(userId);
  if (!pet) {
    return null;
  }

  return updatePetStats(userId, {
    hunger: pet.hunger + amount
  });
}

/**
 * Make pet happy (heart gesture)
 * @param {string} userId - User ID
 * @param {number} amount - Happiness amount (default 10)
 * @returns {object|null} Updated pet data
 */
function makePetHappy(userId, amount = 10) {
  const pet = getPetById(userId);
  if (!pet) {
    return null;
  }

  return updatePetStats(userId, {
    happiness: pet.happiness + amount
  });
}

/**
 * Increase intimacy with pet
 * @param {string} userId - User ID
 * @param {number} amount - Intimacy amount (default 10)
 * @returns {object|null} Updated pet data
 */
function increaseIntimacy(userId, amount = 10) {
  const pet = getPetById(userId);
  if (!pet) {
    return null;
  }

  return updatePetStats(userId, {
    intimacy: pet.intimacy + amount
  });
}

/**
 * Pet the cat
 * @param {string} userId - User ID
 * @param {number} happinessBonus - Happiness bonus (default 5)
 * @param {number} intimacyBonus - Intimacy bonus (default 5)
 * @returns {object|null} Updated pet data
 */
function petCat(userId, happinessBonus = 5, intimacyBonus = 5) {
  const pet = getPetById(userId);
  if (!pet) {
    return null;
  }

  return updatePetStats(userId, {
    happiness: pet.happiness + happinessBonus,
    intimacy: pet.intimacy + intimacyBonus,
    last_pet: new Date().toISOString()
  });
}

/**
 * Delete pet
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
function deletePet(userId) {
  const stmt = db.prepare('DELETE FROM pets WHERE user_id = ?');
  const result = stmt.run(userId);
  return result.changes > 0;
}

/**
 * Get all pets (admin only)
 * @param {number} limit - Max results
 * @param {number} offset - Offset
 * @returns {array} List of pets
 */
function getAllPets(limit = 100, offset = 0) {
  const stmt = db.prepare(`
    SELECT * FROM pets 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset);
}

/**
 * Close database connection
 */
function closeDatabase() {
  db.close();
}

module.exports = {
  db,
  initDatabase,
  createPet,
  getPetById,
  updatePetStats,
  feedPet,
  makePetHappy,
  increaseIntimacy,
  petCat,
  deletePet,
  getAllPets,
  closeDatabase
};
