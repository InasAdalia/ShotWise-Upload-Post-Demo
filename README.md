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


  Usage of the above api's libraries can be found in '/server' directory.




## /Client

This frontend can be locally hosted or accessed via website: (https://shotwise-upload-demo.netlify.app/)


## /Server

However, frontend only works with a server that must be locally hosted with '.env' files.

'.env' files are sensitive and are not uploaded into github, only shared for lecturers/team members in Assignment document

p/s: server could not be hosted due to Pinecone operations being too expensive for free hosting services


## How to locally host

clone this repo or download the project, and move the .env file into the server directory.

_OR_

download only the server directory, and move .env file into this directory.

then:

**client/frontend:**

1. open website link (https://shotwise-upload-demo.netlify.app/) and later 'enable access to local server' if asked by browser.

OR

1. open terminal and direct to client folder using ' cd client '
2. run ' npm run dev ' and localhost: XXXX link will be given. click to access it

**server/backend:**

1. open terminal and direct to server folder using ' cd server ' or ' ' cd ../server '
2. run ' npm run dev ' and frontend can now access localhost:8000.
3. to test, open localhost:8000/test or test if frontend works normally now
