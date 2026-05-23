const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  createPet,
  getPetById,
  feedPet,
  makePetHappy,
  increaseIntimacy,
  petCat,
  deletePet
} = require('../database');

const router = express.Router();

/**
 * Create a new pet
 * POST /api/pet/create
 */
router.post('/create', (req, res) => {
  try {
    const userId = uuidv4();
    const name = req.body.name || '小猫咪';

    const pet = createPet(userId, name);

    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      data: {
        userId: pet.user_id,
        name: pet.name,
        hunger: pet.hunger,
        happiness: pet.happiness,
        intimacy: pet.intimacy,
        mood: pet.mood,
        createdAt: pet.created_at
      }
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pet',
      error: error.message
    });
  }
});

/**
 * Get pet status
 * GET /api/pet/:userId
 */
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const pet = getPetById(userId);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
        hint: 'Create a new pet using POST /api/pet/create'
      });
    }

    res.json({
      success: true,
      data: {
        userId: pet.user_id,
        name: pet.name,
        hunger: pet.hunger,
        happiness: pet.happiness,
        intimacy: pet.intimacy,
        mood: pet.mood,
        lastFed: pet.last_fed,
        lastHappy: pet.last_happy,
        lastIntimate: pet.last_intimate,
        lastPet: pet.last_pet,
        createdAt: pet.created_at
      }
    });
  } catch (error) {
    console.error('Error getting pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pet',
      error: error.message
    });
  }
});

/**
 * Feed the pet
 * POST /api/pet/:userId/feed
 */
router.post('/:userId/feed', (req, res) => {
  try {
    const { userId } = req.params;
    const amount = parseInt(req.body.amount) || 15;

    const pet = feedPet(userId, amount);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      message: `Fed the pet! Hunger increased by ${amount}`,
      data: {
        userId: pet.user_id,
        name: pet.name,
        hunger: pet.hunger,
        happiness: pet.happiness,
        intimacy: pet.intimacy,
        mood: pet.mood
      }
    });
  } catch (error) {
    console.error('Error feeding pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to feed pet',
      error: error.message
    });
  }
});

/**
 * Make pet happy (heart gesture)
 * POST /api/pet/:userId/happy
 */
router.post('/:userId/happy', (req, res) => {
  try {
    const { userId } = req.params;
    const amount = parseInt(req.body.amount) || 10;

    const pet = makePetHappy(userId, amount);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      message: `Heart gesture sent! Happiness increased by ${amount}`,
      data: {
        userId: pet.user_id,
        name: pet.name,
        hunger: pet.hunger,
        happiness: pet.happiness,
        intimacy: pet.intimacy,
        mood: pet.mood
      }
    });
  } catch (error) {
    console.error('Error making pet happy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make pet happy',
      error: error.message
    });
  }
});

/**
 * Intimate interaction with pet
 * POST /api/pet/:userId/intimate
 */
router.post('/:userId/intimate', (req, res) => {
  try {
    const { userId } = req.params;
    const amount = parseInt(req.body.amount) || 10;

    const pet = increaseIntimacy(userId, amount);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      message: `Intimacy increased by ${amount}!`,
      data: {
        userId: pet.user_id,
        name: pet.name,
        hunger: pet.hunger,
        happiness: pet.happiness,
        intimacy: pet.intimacy,
        mood: pet.mood
      }
    });
  } catch (error) {
    console.error('Error increasing intimacy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increase intimacy',
      error: error.message
    });
  }
});

/**
 * Pet the cat
 * POST /api/pet/:userId/pet
 */
router.post('/:userId/pet', (req, res) => {
  try {
    const { userId } = req.params;
    const happinessBonus = parseInt(req.body.happinessBonus) || 5;
    const intimacyBonus = parseInt(req.body.intimacyBonus) || 5;

    const pet = petCat(userId, happinessBonus, intimacyBonus);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      message: `Pet! Happiness +${happinessBonus}, Intimacy +${intimacyBonus}`,
      data: {
        userId: pet.user_id,
        name: pet.name,
        hunger: pet.hunger,
        happiness: pet.happiness,
        intimacy: pet.intimacy,
        mood: pet.mood
      }
    });
  } catch (error) {
    console.error('Error petting cat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pet cat',
      error: error.message
    });
  }
});

/**
 * Delete pet
 * DELETE /api/pet/:userId
 */
router.delete('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const success = deletePet(userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pet',
      error: error.message
    });
  }
});

module.exports = router;
