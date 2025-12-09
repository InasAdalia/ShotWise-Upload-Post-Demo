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
// app.post('/music/bulk-search', async (req, res) => {
//   try {
//     console.log('body:', req.body); // should be an array

//     const list = req.body || [];
//     const promises = list.map((item) =>
//       spotifyPreviewFinder(item.title, item.artist, item)
//     );

//     const results = await Promise.all(promises);
//     res.json(results);
//   } catch (err) {
//     console.error('bulk-search error:', err); // check your server console
//     res.status(500).json({ error: err.message });
//   }
// });


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






