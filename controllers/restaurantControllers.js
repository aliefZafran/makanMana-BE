const overpassService = require("../services/overpassService");
const restaurantMemory = require("../models/restaurantMemory");
const scoringService = require("../services/scoringService");
const tagMemory = require("../models/tagMemory");
const shuffle = require('../services/shuffleRestaurant');

exports.fetchRestaurants = async (req, res) => {
  const { lat, lon, radius = 3000 } = req.body;

  if (!lat || !lon)
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });

  try {
    const restaurants = await overpassService.fetchRestaurantsFromOverpass(
      lat,
      lon,
      radius
    );
    const shuffledRestaurants = shuffle(restaurants)

    restaurantMemory.setRestaurants(shuffledRestaurants);
    return res.json({
        success: true,
        message:
          restaurants.length === 0
            ? 'No restaurants found nearby'
            : 'Restaurants found',
        data: shuffledRestaurants,
      });
  } catch (error) {
    console.error("Overpass fetch failed:", error);
    res.status(500).json({ error: "Error fetching from Overpass" });
  }
};

exports.registerSwipe = (req, res) => {
  const { restaurantId, direction } = req.body;
  const restaurant = restaurantMemory.findById(restaurantId);

  if (!restaurant)
    return res.status(404).json({ error: "Restaurant not found" });

  Object.entries(restaurant.tags || {}).forEach(([key, value]) => {
    const tag = `${key}:${value}`;
    if (direction === "right") tagMemory.likeTag(tag);
    else if (direction === "left") tagMemory.dislikeTag(tag);
  });

  if (direction === "right") {
    tagMemory.likeRestaurant(restaurantId);
  } else if (direction === "left") {
    tagMemory.dislikeRestaurant(restaurantId); // 🆕
  }

  res.json({
    message: `Swiped ${direction} for ${restaurant.name}`,
    // likedTags: tagMemory.userLikedTags,
    // dislikedTags: tagMemory.userDislikedTags,
  });
};

exports.getRecommendations = (req, res) => {
  const restaurants = restaurantMemory.getRestaurants();

  if (!restaurants || restaurants.length === 0) {
    return res
      .status(404)
      .json({
        error:
          "No restaurant data available. Please fetch nearby restaurants first.",
      });
  }

  const scored = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    score: scoringService.calculateScore(r),
  }));

  scored.sort((a, b) => b.score - a.score);
  res.json(scored);
};

exports.clearScore = (req, res) => {
    tagMemory.clearPreferences();
    const restaurants = restaurantMemory.getRestaurants();
    
    const clearedScore = restaurants.map(r => ({
        id: r.id,
        name: r.name,
        score: scoringService.calculateScore(r)
    }));

    res.json({
        message: "Score is cleared",
        recommendations: clearedScore,
    })
}

exports.getAllRestaurants = (req, res) => {
  res.json(restaurantMemory.getRestaurants());
};
