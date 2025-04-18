const calculateDistance = require ("./calculateDistance")

function extractRelevantTags(tags = {}) {
  const allowedTags = ['cuisine', 'takeaway', 'halal', 'delivery', 'outdoor_seating'];
  const filtered = {};

  Object.entries(tags).forEach(([key, value]) => {
    if (allowedTags.includes(key) || key.startsWith('diet:')) {
      filtered[key] = value;
    }
  });

  return filtered;
}


exports.fetchRestaurantsFromOverpass = async (lat, lon, radius) => {
  const query = `
    [out:json];
    node
      [amenity=restaurant]
      (around:${radius},${lat},${lon});
    out body;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  const data = await response.json();

  return data.elements.filter(element => element.tags?.name)
  .map(element => {
    const restaurantLat = element.lat;
    const restaurantLon = element.lon;

    return {  
      id: element.id,
      name: element.tags.name,
      lat: restaurantLat,
      lon: restaurantLon,
      tags: extractRelevantTags(element.tags),
      distance_km: calculateDistance(lat, lon, restaurantLat, restaurantLon),
    };
  });
};
