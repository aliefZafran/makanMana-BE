const calculateDistance = require("./calculateDistance");

function extractRelevantTags(tags = {}) {
  const allowedTags = [
    "cuisine",
    "takeaway",
    "halal",
    "delivery",
    "outdoor_seating",
  ];
  const filtered = {};

  Object.entries(tags).forEach(([key, value]) => {
    if (allowedTags.includes(key) || key.startsWith("diet:")) {
      filtered[key] = value;
    }
  });

  return filtered;
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 4000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });

  clearTimeout(id);
  return response;
}

exports.fetchRestaurantsFromOverpass = async (lat, lon, radius) => {
  const query = `
    [out:json];
    node
      [amenity=restaurant]
      (around:${radius},${lat},${lon});
    out body;
  `;

  try {
    const response = await fetchWithTimeout(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
        timeout: 4000,
      }
    );

    const data = await response.json();

    return data.elements
      .filter((element) => element.tags?.name)
      .map((element) => {
        const restaurantLat = element.lat;
        const restaurantLon = element.lon;

        return {
          id: element.id,
          name: element.tags.name,
          lat: restaurantLat,
          lon: restaurantLon,
          tags: extractRelevantTags(element.tags),
          distance_km: calculateDistance(
            lat,
            lon,
            restaurantLat,
            restaurantLon
          ),
        };
      });
  } catch (err) {
    console.error("Overpass error:", err.message);
    throw new Error("Overpass API failed");
  }
};
