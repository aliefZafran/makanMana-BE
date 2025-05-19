const express = require('express');
const router = express.Router();
const controller = require('../controllers/restaurantControllers');
const googleController = require('../controllers/restaurantGoogleControllers');
const photoProxyController = require('../controllers/photoProxyController');

router.get('/test', controller.testApi);
router.post('/restaurants', controller.fetchRestaurants);
router.post('/swipe', controller.registerSwipe);
router.get('/get-restaurants', controller.getAllRestaurants);
router.get('/recommendations', controller.getRecommendations);
router.post('/clearScore', controller.clearScore);

// router.get('/v2/fetch-mock', googleController.fetchMock)
router.post('/v2/fetch-restaurants', googleController.fetchRestaurants)
router.post('/v2/swipe', controller.registerSwipe);
router.get('/v2/restaurants', googleController.getAllRestaurants);
router.get('/v2/recommendations', googleController.getRecommendations);
router.post('/v2/clearScore', googleController.clearScore);

router.get('/v2/photos', photoProxyController.getPlacePhoto);

module.exports = router;