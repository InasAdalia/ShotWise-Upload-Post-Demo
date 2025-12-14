const axios = require('axios'); //for http requests
const express = require('express');
const app = express();
app.use(express.json());

//this is for .env where secrets are stored.
const dotenv = require('dotenv'); 
dotenv.config();

// CORS setup
const cors = require('cors'); // cors are for cross-origin resource sharing
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.listen(8000, () => console.log('Server running'));

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;


// test endpoint
app.get("/test", (req, res) => {
  res.json({ fruits: ["apple", "banana", "orange"] });
});

/*  ------------------------------------- 1. SUPABASE ENDPOINTS--------------------------------- */
const { createClient } = require('@supabase/supabase-js');
const imageUrl = 'https://xlpwosvjzyffqmiicqpf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(imageUrl, supabaseKey)
const BUCKET = 'gallery-images';

// 1. Upload image to Supabase
app.post('/supabase/fetch', async (req, res) => {
    try {
      const { data } = supabase
      .storage
      .from(BUCKET)
      .getPublicUrl('mine_2023.jpg')

      res.json(data)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
})


/*  ------------------------------------- 2. SPOTIFY ENDPOINTS--------------------------------- */
 //extra library to access music previews since spotify api has removed them
const spotifyPreviewFinder = require('spotify-preview-finder');

// 1. get Spotify token
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

//2. bulk fetch songs by titles using spotifyPreviewFinder
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

/* ------------------------------------- 3. PINECONE ENDPOINTS--------------------------------- */
const { index } = require('./Pinecone'); //index is the 'bucket' of our embeddings storage
const imageEmbedder = require('./ImageEmbedder'); //imageEmbedder is the class that generates embeddings

// 1. Extract embedding and upload into Pinecone
app.post('/image/upload-and-index', async (req, res) => {
  try {
    const { imageName, imageUrl } = req.body;
    //imageUrl must be a supabase public url

     // 1. Generate embedding for the image
    console.log('Step 1: Generating embedding...');
    const embedding = await imageEmbedder.embedImage(imageUrl);
    console.log('Embedding dimensions:', embedding.length);

    // 2. Store in Pinecone with metadata OR 'indexing' in Pinecone
    console.log('Step 2: Storing in Pinecone...');
    await index.namespace('default').upsert([
      {
        id: imageName,
        values: embedding,
        metadata: {
          imageName,
          imageUrl: imageUrl,
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

// 2. fetch any 10 random image urls from Pinecone
app.get('/image/fetch-any', async (req, res) => {
  try {
    // Build a random vector with same dimension as your embeddings (e.g. 512)
    const dim = 512; // set to the actual dimension of your CLIP model
    const randomVector = Array.from({ length: dim }, () => Math.random());

    const results = await index.namespace('default').query({
      vector: randomVector,
      topK: 10,
      includeMetadata: true,
      includeValues: false,
    });

    const images = results.matches.map((match) => ({
      id: match.id,
      imageName: match.metadata.imageName,
      imageUrl: match.metadata.imageUrl,
      score: match.score,
    }));

    res.json({ success: true, results: images });
  } catch (error) {
    console.error('Sample fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Search for top 10 most similar images
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

// test: list down all indexed images
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


// for Pinecone storage setup only: bulk upload & index images
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