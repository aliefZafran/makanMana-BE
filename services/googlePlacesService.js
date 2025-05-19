const axios = require('axios');

class GooglePlacesService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://places.googleapis.com/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.photos,places.googleMapsUri,places.location'
    };
  }

  /**
   * Search for nearby places
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in meters
   * @param {number} maxResults - Maximum number of results to return (max 20)
   * @returns {Promise<Array>} - Array of places
   */
  async searchNearby(lat, lng, radius = 3000, maxResults = 20) {
    try {
      // Prepare the request body
      const requestBody = {
        includedTypes: ["restaurant"],
        excludedTypes: ["gas_station"],
        maxResultCount: Math.min(maxResults, 20), // Google's max per request
        locationRestriction: {
          circle: {
            center: { 
              latitude: parseFloat(lat), 
              longitude: parseFloat(lng) 
            },
            radius: radius
          }
        }
      };

      // Conditionally add rankPreference based on radius
      if (radius === 1000) {
        requestBody.rankPreference = "DISTANCE";
      }

      const response = await axios.post(
        `${this.baseUrl}/places:searchNearby?key=${this.apiKey}`,
        requestBody,
        { 
          headers: this.defaultHeaders,
          timeout: 10000 // 10 second timeout
        }
      );
      
      // Return both places and the full response for flexibility
      return {
        places: response.data?.places || [],
        nextPageToken: response.data?.nextPageToken || null
      };
    } catch (error) {
      console.error('Google Places API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to fetch places from Google Places API');
    }
  }

  /**
   * Get photo URL that uses our proxy endpoint
   * @param {string} photoRef - Photo reference from Google Places
   * @param {number} maxWidth - Maximum width in pixels (default: 400)
   * @returns {string} - Proxied photo URL
   */
  getPhotoUrl(photoRef, maxWidth = 400) {
    if (!photoRef) return null;
    // Return a URL that hits our proxy endpoint
    return `${process.env.LOCALHOST}/photos?photoReference=${encodeURIComponent(photoRef)}&maxWidth=${maxWidth}`;
  }

  /**
   * Get place details
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object>} - Place details
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/places/${placeId}?key=${this.apiKey}`,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,types,photos,googleMapsUri,location'
          } 
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching place details:', error.message);
      throw new Error('Failed to fetch place details');
    }
  }
}

// Create and export a singleton instance
const googlePlacesService = new GooglePlacesService(process.env.GOOGLE_MAPS_API_KEY);
module.exports = googlePlacesService;
