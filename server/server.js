// File: server/server.js
// import axios from "axios";
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";

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

// =============== SENTISIGHT AI ====================
const baseUrl = 'https://platform.sentisight.ai/api/'
const token = process.env.SENTISIGHT_API_TOKEN
const projectID = process.env.SENTISIGHT_PROJECT_ID
const jsonHeaders = {
  'Content-Type': 'application/json',
  'X-Auth-token': token,
};

app.post("/image/upload", async (req, res) => {
  try{
    const { imageName, imageUrl } = req.body;
    
    const result = await fetch(`${baseUrl}/image/${projectID}/${imageName}?preprocess=${true}`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({url: imageUrl})
    })

    if (!result || !result.ok) {
      const errorMsg = await result.text()
      throw new Error(`image upload to sentisight failed: ${result.statusText} ${errorMsg}`)
    }
    return res.json({ 'message': `should be uploading well ${imageName} ${imageUrl}`});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

// File: server\server.js

// File: server\server.js
app.post('/image/delete', async (req, res) => {
  try {
    const { imageName } = req.body;

    // ✅ Include Content-Type: text/plain as per Sentisight docs
    const result = await fetch(`${baseUrl}image/${projectID}/fv`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'text/plain',
        'X-Auth-token': token,
      },
    });
    
    console.log('Response status:', result.status);
    console.log('Response statusText:', result.statusText);
    
    if (!result.ok) {
      const errorMsg = await result.text();
      console.error('Sentisight error response:', errorMsg);
      throw new Error(`Image deletion from sentisight failed: ${result.status} ${result.statusText} - ${errorMsg}`);
    }
    
    // Sentisight might return text or json, handle both
    const contentType = result.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await result.json();
    } else {
      data = await result.text();
    }
    
    console.log('Delete successful, response:', data);
    res.json({ message: 'Image deleted successfully', data });
    
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


app.post('/image/similarity', async(req, res)=>{
  try {

     const { 
      imageName, 
      labels = [],           // optional: array of labels to filter by
      andOperator = false,   // optional: use AND logic for labels (default OR)
      limit = 8,           // optional: number of results to return
      threshold = 0.5         // optional: minimum similarity score (0-1)
    } = req.body;

    // Build query string with optional parameters
    let queryParams = `project=${projectID}`;
    
    // Add labels if provided
    if (labels && labels.length > 0) {
      labels.forEach(label => {
        queryParams += `&labels=${encodeURIComponent(label)}`;
      });
      queryParams += `&and=${andOperator}`;
    }
    
    // Add limit and threshold
    queryParams += `&limit=${limit}`;
    queryParams += `&threshold=${threshold}`;

    const url = `${baseUrl}similarity?${queryParams}`;
    console.log('Full URL:', url);

    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Auth-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageName })
    });
    res.json({ success: true, url, result:result });

    if (!result.ok) {
      const errorMsg = await result.text();
      throw new Error(`Similarity search failed: ${result.status} ${result.statusText} - ${errorMsg}`);
    }

    const data = await result.json();
    // res.json({ success: true, result: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})



app.post('/image/similarity-google', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    const response = await fetch('https://google-reverse-image-api.vercel.app/reverse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    });

    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
