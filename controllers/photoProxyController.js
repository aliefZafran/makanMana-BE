const axios = require('axios');

class PhotoProxyController {
  static async getPlacePhoto(req, res) {
    try {
      const { photoReference, maxWidth = 400 } = req.query;
      
      if (!photoReference) {
        return res.status(400).json({ error: 'Photo reference is required' });
      }

      const url = `https://places.googleapis.com/v1/${photoReference}/media`;
      const response = await axios({
        method: 'get',
        url,
        params: {
          key: process.env.GOOGLE_MAPS_API_KEY,
          maxWidthPx: Math.min(Number(maxWidth), 1200) // Cap at 1200px
        },
        responseType: 'arraybuffer'
      });

      // Forward the image data
      res.set('Content-Type', response.headers['content-type']);
      res.send(response.data);
    } catch (error) {
      console.error('Error proxying photo:', error.message);
      // Return a default image or error image
      res.redirect('https://picsum.photos/300/400');
    }
  }
}

module.exports = PhotoProxyController;
