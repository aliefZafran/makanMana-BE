const userLikedTags = {};
const userDislikedTags = {};

const likedRestaurants = new Set();
const dislikedRestaurants = new Set();

function clearPreferences(){
  Object.keys(userLikedTags).forEach(key => delete userLikedTags[key]);
  Object.keys(userDislikedTags).forEach(key => delete userDislikedTags[key]);
  likedRestaurants.clear();
  dislikedRestaurants.clear();
}

function likeTag(tag) {
  userLikedTags[tag] = (userLikedTags[tag] || 0) + 5;
}

function dislikeTag(tag) {
  userDislikedTags[tag] = (userDislikedTags[tag] || 0) + 3;
}

function likeRestaurant(id) {
  likedRestaurants.add(id);
}

function dislikeRestaurant(id) {
  dislikedRestaurants.add(id);
}

function hasLikedRestaurant(id) {
  return likedRestaurants.has(id);
}

function hasDislikedRestaurant(id) {
  return dislikedRestaurants.has(id);
}

module.exports = {
  userLikedTags,
  userDislikedTags,
  likeTag,
  dislikeTag,
  likeRestaurant,
  dislikeRestaurant,
  hasLikedRestaurant,
  hasDislikedRestaurant,
  clearPreferences
};
