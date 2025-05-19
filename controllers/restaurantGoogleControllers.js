const restaurantMemory = require("../models/restaurantMemory");
const tagMemory = require("../models/tagMemory");
const scoringService = require("../services/scoringService");
const shuffle = require("../services/shuffleRestaurant");
// const mockData = require("../mock.json");
const calculateDistance = require("../services/calculateDistance");
const googlePlacesService = require("../services/googlePlacesService");
const DEFAULT_PHOTO_URL = "https://picsum.photos/300/400";

function extractTagsFromGooglePlace(place) {
  const tags = {};

  // Infer tags from types
  const restaurantTypes =
    place.types
      ?.filter((type) => /_restaurant$/.test(type))
      .map((type) => type.replace("_restaurant", "").replace(/_/g, " ")) || [];

  tags.type = restaurantTypes;

  if (place.types?.includes("meal_takeaway")) tags.takeaway = "yes";
  if (place.types?.includes("restaurant")) tags.amenity = "restaurant";
  if (place.types?.includes("cafe")) tags.amenity = "cafe";
  if (place.types?.includes("food_court")) tags.amenity = "food court";

  // Infer from name
  const name = place.displayName?.text?.toLowerCase() || "";
  if (name.includes("halal")) tags.halal = "yes";

  return tags;
}

function constructPhotoUrl(photoRef) {
  return googlePlacesService.getPhotoUrl(photoRef);
}

exports.fetchRestaurants = async (req, res) => {
  const { lat, lon, radius = 3000 } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  console.log(`Fetching restaurants within ${radius}m of (${lat}, ${lon})`);

  try {
    const { places } = await googlePlacesService.searchNearby(
      lat,
      lon,
      Number(radius),
      20 // maxResults
    );
    
    let currentId = 1;
    const transformed = places.map((place) => ({
      id: currentId++,
      name: place.displayName?.text,
      address: place.formattedAddress,
      rating: place.rating,
      photo: place.photos?.[0] ? constructPhotoUrl(place.photos[0].name) : DEFAULT_PHOTO_URL,
      tags: extractTagsFromGooglePlace(place),
      linkToLocation: place.googleMapsUri,
      distance: place.location ? Math.round(
        calculateDistance(
          { lat: parseFloat(lat), lng: parseFloat(lon) },
          { lat: place.location.latitude, lng: place.location.longitude }
        )
      ) : null
    }));

    const shuffledRestaurants = shuffle(transformed);
    restaurantMemory.setRestaurants(shuffledRestaurants);

    return res.json({
      success: true,
      message: shuffledRestaurants.length === 0 
        ? "No restaurants found nearby" 
        : "Restaurants found",
      data: shuffledRestaurants
    });
  } catch (err) {
    console.error("Google Places API fetch error:", err.response?.data || err.message);
    res.status(502).json({ 
      success: false,
      error: "Failed to fetch restaurants. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? (err.response?.data || err.message) : undefined
    });
  }
};

// exports.fetchMock = (req, res) => {
//   const places = mockData.places;
//   let currentId = 1;
//   console.log("fetching from mock");

//   const transformed = places.map((place) => ({
//     id: currentId++,
//     name: place.displayName?.text,
//     address: place.formattedAddress,
//     rating: place.rating,
//     photo: place.photos?.[0]
//       ? constructPhotoUrl(place.photos[0].name)
//       : DEFAULT_PHOTO_URL,
//     tags: extractTagsFromGooglePlace(place),
//     linkToLocation: place.googleMapsUri,
//   }));

//   const shuffledRestaurants = shuffle(transformed);
//   restaurantMemory.setRestaurants(shuffledRestaurants);

//   return res.json({
//     success: true,
//     message:
//       shuffledRestaurants.length === 0
//         ? "No restaurants found in mock data"
//         : "Mock restaurants found",
//     data: shuffledRestaurants,
//   });
// };

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
    tagMemory.dislikeRestaurant(restaurantId);
  }

  res.json({
    message: `Swiped ${direction} for ${restaurant.name}`,
  });
};

exports.getRecommendations = (req, res) => {
  const restaurants = restaurantMemory.getRestaurants();

  if (!restaurants || restaurants.length === 0) {
    return res.status(404).json({
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

  const clearedScore = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    score: scoringService.calculateScore(r),
  }));

  res.json({
    message: "Score is cleared",
    recommendations: clearedScore,
  });
};

exports.getAllRestaurants = (req, res) => {
  res.json(restaurantMemory.getRestaurants());
};
