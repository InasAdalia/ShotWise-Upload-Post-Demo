# ShotWise
ShotWise is an app that uses AI to help users take photos with right composure, zoom, and angle. 
While attempting shots users will see real-time inspirations popping up tailored based on their subject, or users can just explore more in the Feed page.

## Demo
This repo demonstrates:
1. **Visual technique**

  Pinecone is used to store vector embeddings of photos (via public url of image), and perform cosine similarity search based on a photo input.
  Pinecone's free tier is limited, allowing this project to upload only a limited number of photos for similarity fetching.
 
2. **Audio technique**

  Spotify API is used to fetch song informations; audio track, author, album, etc. 
  However, only 15s audio previews can be demonstrated in this project as full songs require paid license. 
  
  In this project, only a few songs are pre-fetched and there are no search songs feature as this is for demo puproses only.

3. **Storage**

  Images are stored, fetched and displayed from Supabase storage via its public Url.


  Usage of the above api's/libraries can be found in '/server' directory.
