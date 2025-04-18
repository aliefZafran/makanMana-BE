const express = require('express');
const router = express.Router();
const controller = require('../controllers/restaurantControllers');

router.post('/restaurants', controller.fetchRestaurants);
router.post('/swipe', controller.registerSwipe);
router.get('/restaurants', controller.getAllRestaurants);
router.get('/recommendations', controller.getRecommendations);
router.post('/clearScore', controller.clearScore);

module.exports = router;