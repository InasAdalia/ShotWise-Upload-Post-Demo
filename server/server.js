// File: server/server.js
// import axios from "axios";
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
const { Pinecone: PineconeClient } = require('@pinecone-database/pinecone');


const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json());

const dotenv = require('dotenv');
const cors = require('cors');
const spotifyPreviewFinder = require('spotify-preview-finder');
dotenv.config();
// const spotifyPreviewFinder = await import('spotify-preview-finder').then(mod => mod.default);

// CORS setup
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.listen(8000, () => console.log('Server running'));

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;


// Default route
app.get("/test", (req, res) => {
  res.json({ fruits: ["apple", "banana", "orange"] });
});

// 1. Spotify: get Spotify token
async function getSpotifyToken() {
  const tokenUrl = "https://accounts.spotify.com/api/token";

  const formData = new URLSearchParams();
  formData.append("grant_type", "client_credentials");

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await axios.post(tokenUrl, formData, {
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data.access_token;
}

//2. Spotify: search for tracks
app.get("/music/search", async (req, res)=>{
    try {
        // const {title, artist, limit} = req.query;

        // if (!q) return res.status(400).json({ error: 'Query parameter "q" required' });

        // Search by song name only (limit is optional, default is 5)
        const result = await spotifyPreviewFinder('Strategy', 'twice', 1);
    
        if (result.success) {
            res.json(result);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//3. To play the audio preview from spotify
app.get('/music/proxy-preview', async (req, res) => {
  try {
    const { url } = req.query;
      if (!url) return res.status(400).send("URL required");

    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    console.log(response)
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//Spotify: bulk fetch songs by titles
app.post('/music/bulk-search', async (req, res) => {
  try { 
    const searches = req.body; // [{ title, artist, limit }, ...]

    const results = [];

    for (const search of searches) {
      let result;
      if (search.artist) {
        result = await spotifyPreviewFinder(search.title, search.artist, search.limit || 1);
      } else {
        result = await spotifyPreviewFinder(search.title, search.limit || 1);
      }

      if (result.success && result.results.length > 0) {
        const song = result.results[0];
        results.push({
          title: song.name,
          artist: search.artist ?? '',
          previewUrl: song.previewUrls?.[0] ?? null,
          trackId: song.trackId,
          albumName: song.albumName,
          releaseDate: song.releaseDate,
          popularity: song.popularity,
        });

        
      } else {
        results.push(null); // or skip; up to you
      }
    }

    res.json(results);
  } catch (err) {
    console.error('bulk-search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Spotify: get ONE specific track
app.get("/music/test-song", async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await axios.get(
      "https://api.spotify.com/v1/tracks/7lPN2DXiMsVn7XUKtOW1CS",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(response.data);  // return the track object
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------- EMBEDDER UTILITY -------------
// File: server\utils\imageEmbedder.js
// File: server\utils\imageEmbedder.js

const { pipeline, RawImage } = require('@xenova/transformers');

class ImageEmbedder {
  constructor() {
    this.extractor = null;
  }

  async init() {
    if (!this.extractor) {
      console.log('Loading CLIP model...');
      // Use 'image-feature-extraction' instead of 'feature-extraction'
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
      
      // Load the image using RawImage
      const image = await RawImage.fromURL(imageUrl);
      
      console.log('Generating embedding...');
      
      // Generate embedding
      const output = await this.extractor(image);
      
      // Extract the embedding array
      const embedding = Array.from(output.data);
      
      console.log('Embedding generated, dimension:', embedding.length);
      
      return embedding;
      
    } catch (error) {
      console.error('Error embedding image:', error);
      throw new Error(`Failed to embed image: ${error.message}`);
    }
  }
}

// -------------- PINECONE --------------
// File: server\utils\pineconeClient.js

const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME || 'image-search';
const index = pinecone.index(indexName);

const imageEmbedder = new ImageEmbedder();

// ============= UPLOAD & INDEX IMAGE =============
app.post('/image/upload-and-index', async (req, res) => {
  try {
    const { imageName, imageUrl } = req.body;

    console.log('Uploading and indexing:', imageName);

     // 1. Generate embedding for the image
    console.log('Step 1: Generating embedding...');
    const embedding = await imageEmbedder.embedImage(imageUrl);
    console.log('Embedding dimensions:', embedding.length);

    // 2. Store in Pinecone with metadata
    console.log('Step 2: Storing in Pinecone...');
    await index.namespace('default').upsert([
      {
        id: imageName,
        values: embedding,
        metadata: {
          imageName,
          imageUrl,
          uploadedAt: new Date().toISOString(),
        },
      },
    ]);

    console.log('✅ Image indexed successfully!');
    res.json({
      success: true,
      message: 'Image uploaded and indexed',
      imageName,
      dimensions: embedding.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= SEARCH SIMILAR IMAGES =============
app.post('/image/similarity-search', async (req, res) => {
  try {
    const { imageUrl, topK = 10 } = req.body;

    console.log('Searching for similar images...');

    // 1. Generate embedding for query image
    const queryEmbedding = await imageEmbedder.embedImage(imageUrl);

    // 2. Search Pinecone for similar vectors
    const results = await index.namespace('default').query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      includeValues: false,
    });

    // 3. Format results
    const similarImages = results.matches.map((match) => ({
      imageName: match.metadata.imageName,
      imageUrl: match.metadata.imageUrl,
      score: match.score, // Similarity score (0-1)
    }));

    console.log(`Found ${similarImages.length} similar images`);
    res.json({
      success: true,
      results: similarImages,
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= DELETE IMAGE FROM INDEX =============
app.post('/image/delete-from-index', async (req, res) => {
  try {
    const { imageName } = req.body;

    await index.namespace('default').deleteOne(imageName);

    console.log('Image deleted from index:', imageName);
    res.json({
      success: true,
      message: 'Image deleted from index',
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= LIST ALL INDEXED IMAGES =============
app.get('/image/list-indexed', async (req, res) => {
  try {
    // Note: Pinecone doesn't have a built-in list all function
    // You'd need to maintain a separate list or use namespaces
    res.json({
      message: 'To list images, query with a sample image or maintain a separate index',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ============= BULK UPLOAD & INDEX IMAGES =============
app.post('/image/bulk-upload-and-index', async (req, res) => {
  try {
    const { images } = req.body; // array of image URLs

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'images must be a non-empty array' });
    }

    console.log(`Bulk indexing ${images.length} images...`);

    const vectors = [];

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const imageName = `image_${i}_${Date.now()}`;

      console.log('Embedding:', imageUrl);
      const embedding = await imageEmbedder.embedImage(imageUrl);

      vectors.push({
        id: imageName,
        values: embedding,
        metadata: {
          imageName,
          imageUrl,
          uploadedAt: new Date().toISOString(),
        },
      });
    }

    // Upsert all in one call (or chunk if very large)
    await index.namespace('default').upsert(vectors);

    console.log('Bulk upsert complete');
    res.json({
      success: true,
      count: vectors.length,
      images: vectors.map(v => ({
        id: v.id,
        imageUrl: v.metadata.imageUrl,
      })),
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: error.message });
  }
});
