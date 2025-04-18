let restaurantList = [];

function setRestaurants(restaurants) {
  restaurantList = restaurants;
}

function getRestaurants() {
  return restaurantList;
}

function findById(id) {
  return restaurantList.find(r => r.id === id);
}

module.exports = {
  setRestaurants,
  getRestaurants,
  findById
};
