// File: server/server.js
import axios from "axios";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

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
