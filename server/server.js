// File: server/server.js
// import axios from "axios";
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";



const axios = require('axios');
const express = require('express');
const app = express();

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

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

// Default route
app.get("/test", (req, res) => {
  res.json({ fruits: ["apple", "banana", "orange"] });
});

app.get("/music/preview-tracks", async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await axios.get(
      "https://api.spotify.com/v1/search?q=pop&type=track&limit=20",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    

    // This will Filter only songs with preview links
    //apparently doesnt work cz spotify has removed ALL preview thanks might as well just remove the whole api
    // const filtered = response.data.tracks.items.filter(
    //   (track) => track.preview_url !== null
    // );

    res.json(filtered);
  } catch (err) {
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

app.get("/music/search", async (req, res)=>{
    try {
        // const {title, artist, limit} = req.query;

        // if (!q) return res.status(400).json({ error: 'Query parameter "q" required' });

        // Search by song name only (limit is optional, default is 5)
        const result = await spotifyPreviewFinder('Shape of You', 1);
    
        if (result.success) {
            res.json(result);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})



// FUNCTION: get Spotify token
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

//try luck
app.get('/music/proxy-preview', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL required");

    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(8080, () => console.log('Server running'));

