const tagMemory = require('../models/tagMemory');

exports.calculateScore = (restaurant) => {
  let score = 0;

  Object.entries(restaurant.tags || {}).forEach(([key, value]) => {
    const tag = `${key}:${value}`;
    if (tagMemory.userLikedTags[tag]) score += tagMemory.userLikedTags[tag];
    if (tagMemory.userDislikedTags[tag]) score -= tagMemory.userDislikedTags[tag];
  });

  // 🆕 Boost score if restaurant was directly liked
  if (tagMemory.hasLikedRestaurant(restaurant.id)) {
    score += 10; // You can tweak this value
  }
  if (tagMemory.hasDislikedRestaurant(restaurant.id)) {
  score -= 8; // You can tune this number — maybe 5–10 depending on how harsh you want it
}

  // if (restaurant.distance_km < 3) score += 5;
  // else if (restaurant.distance_km < 5) score += 3;
  // else if (restaurant.distance_km < 10) score += 1;
  // else score -= 2;

  return score;
};

exports.calculateScoreNew = (restaurant) => {
  let score = 0;

  // Loop through the tags, and check if the value is an array (for the "type" tag).
  Object.entries(restaurant.tags || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // If the value is an array (like for tags.type), loop through each type.
      value.forEach((tagValue) => {
        const tag = `${key}:${tagValue}`;
        if (tagMemory.userLikedTags[tag]) score += tagMemory.userLikedTags[tag];
        if (tagMemory.userDislikedTags[tag]) score -= tagMemory.userDislikedTags[tag];
      });
    } else {
      // For non-array tags (like "amenity", "halal"), process as before.
      const tag = `${key}:${value}`;
      if (tagMemory.userLikedTags[tag]) score += tagMemory.userLikedTags[tag];
      if (tagMemory.userDislikedTags[tag]) score -= tagMemory.userDislikedTags[tag];
    }
  });

  // Boost score if restaurant was directly liked
  if (tagMemory.hasLikedRestaurant(restaurant.id)) {
    score += 10; // You can tweak this value
  }

  if (tagMemory.hasDislikedRestaurant(restaurant.id)) {
    score -= 8; // You can tune this number — maybe 5–10 depending on how harsh you want it
  }

  // Add distance-based score
  if (restaurant.distance_km < 3) score += 5;
  else if (restaurant.distance_km < 5) score += 3;
  else if (restaurant.distance_km < 10) score += 1;
  else score -= 2;

  return score;
};
