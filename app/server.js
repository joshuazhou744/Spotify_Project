import express from 'express';
import axios from 'axios';
import querystring from 'querystring';
import cors from 'cors';
import dotenv from 'dotenv';
import { access } from 'fs';

dotenv.config()

const app = express()
const PORT = 3000;
app.use(cors({
    origin: 'http://localhost:5173', // Frontend development origin
}));

const client_id = process.env.REACT_APP_CLIENT_ID
const secret = process.env.REACT_APP_CLIENT_SECRET
const redirect_uri = 'http://localhost:3000/callback'
const auth_token = Buffer.from(`${client_id}:${secret}`, 'utf-8').toString('base64')

const getAuth = async () => {
    try {
        // make post request to SpotifyAPI, send client_id and secret
        const token_url = 'https://accounts.spotify.com/api/token'
        const data = qs.stringify({'grant_type': 'client_credentials'})

        const response = await axios.post(token_url, data, {
            headers : {
                'Authorization': `Basic ${auth_token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        // return access token
        return response.data.access_token;
    } catch (error) {
        console.log(error)
    }
}

const getUserPlaylists = async (access_token) => {
    const api_url = 'https://api.spotify.com/v1/me/playlists';

    try {
        const response = await axios.get(api_url, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                limit: 1 // get first playlist
            }
        });
        const playlist = response.data.items[0] // return first playlist

        // Fetch track list for the first playlist
        const tracks_response = await axios.get(playlist.tracks.href, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        playlist.tracks = tracks_response.data.items; // Attach the track list
        return playlist
    } catch (error) {
        console.error('Error fetching playlists', error)
        throw new Error("Failed to fetch playlists")
    }
}

app.get('/api/audio-features/:trackId', async (req, res) => {
    const trackId = req.params.trackId
    try {
        const data = await getAudioFeatures_Track(trackId);
        res.json(data)
    } catch (error) {
        res.status(500).send('Error fetching data')
    }
});

// initiate login

app.get('/login', (req, res) => {
    const scopes = 'playlist-read-private user-library-read';
    const auth_url = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scopes,
            redirect_uri: redirect_uri,
        })
    res.redirect(auth_url)
})

// callback for after login
app.get('/callback', async (req, res) => {
    const code = req.query.code || null

    try {
        console.log('Exchanging authorization code for tokens...');
        const token_response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri,
            client_id: client_id,
            client_secret: secret,
          }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
          })

          const access_token = token_response.data.access_token;
          console.log("access token received")

          const first_playlist = await getUserPlaylists(access_token)

          res.redirect(`http://localhost:5173/playlist?name=${encodeURIComponent(first_playlist.name)}&cover=${encodeURIComponent(first_playlist.images[0].url)}&tracks=${encodeURIComponent(first_playlist.tracks)}`);

    } catch (error) {
        console.error('Error during callback', error)
        res.status(500).send('Error processing Spotify Login')
    }
})

app.listen(PORT, () => {
    console.log(`server listening on localhost port ${PORT}`)
})