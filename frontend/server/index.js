const express = require('express')
const axios = require('axios')
const dotenv = require('dotenv')
const cors = require('cors')

const port = 5050

dotenv.config();

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
var spotify_redirect_url = "http://localhost:3000/auth/callback"

var app = express()
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

app.get('/auth/login', (req, res) => {
    console.log('login requested')
    var scope = "streaming user-read-email user-read-private";
    var state = generateRandomString(16)
    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: spotify_redirect_url,
        state: state
    })
    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString())
})

app.get('/auth/callback', async (req, res) => {
    var code = req.query.code

    try {
        const authOptions = {
            method: "post",
            url: 'https://accounts.spotify.com/api/token',
            data : new URLSearchParams({
                code: code,
                redirect_uri: spotify_redirect_url,
                grant_type: 'authorization_code'
            }),
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        const response = await axios(authOptions);
        if (response.status === 200) {
            access_token = response.data.access_token;
            console.log('Access Token:', access_token);
            res.redirect('/auth/token'); 
        }
    } catch (error) {
        console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to retrieve access token');
  }
})

app.get('/auth/token', (req, res) => {
    res.json(
        {
            access_token: access_token
        }
    )
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})