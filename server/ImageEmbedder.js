// File: server\utils\imageEmbedder.js

const { pipeline, RawImage } = require('@xenova/transformers');

class ImageEmbedder {
  constructor() {
    this.extractor = null;
  }

  async init() {
    if (!this.extractor) {
      console.log('Loading CLIP model...');
      this.extractor = await pipeline(
        'image-feature-extraction',
        'Xenova/clip-vit-base-patch32'
      );
      console.log('CLIP model loaded!');
    }
  }

  async embedImage(imageUrl) {
    await this.init();
    
    try {
      console.log('Loading image from URL:', imageUrl);
      
      const image = await RawImage.fromURL(imageUrl);
      
      console.log('Generating embedding...');
      
      const output = await this.extractor(image);
      
      const embedding = Array.from(output.data);
      
      console.log('Embedding generated, dimension:', embedding.length);
      
      return embedding;
      
    } catch (error) {
      console.error('Error embedding image:', error);
      throw new Error(`Failed to embed image: ${error.message}`);
    }
  }
}

module.exports = new ImageEmbedder();