const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const router = express.Router();


const redirect_uri = process.env.REDIRECT_URI;


router.get('/login', (req, res) => {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: 'user-read-private user-read-email user-top-read',
      redirect_uri
    }));
});


router.get('/callback', (req, res) => {
  const code = req.query.code || null;


  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    }),
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(
        process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
      ).toString('base64')),
    }
  };


  axios.post(authOptions.url, authOptions.data, {headers: authOptions.headers})
    .then(response => {
      const { data } = response;
      const access_token = data.access_token,
            refresh_token = data.refresh_token;


      console.log(`Access Token: ${access_token}`);
      console.log(`Refresh Token: ${refresh_token}`);


      // Store the access and refresh tokens in the user session
      req.session.access_token = access_token;
      req.session.refresh_token = refresh_token;


      // Redirect to the stats page
      res.redirect('/stats#authenticated');
    })
    .catch(error => {
      console.log(error);
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    });
});


router.get('/refresh_token', (req, res) => {
  console.log("Callback hit");  // Add this line
  const refresh_token = req.session.refresh_token;


  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token
    }),
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(
        process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
      ).toString('base64')),
    }
  };


  axios.post(authOptions.url, authOptions.data, {headers: authOptions.headers})
    .then(response => {
      const { data } = response;
      const access_token = data.access_token;


      // Update the access token in the user session
      req.session.access_token = access_token;


      res.send({
        'access_token': access_token
      });
    })
    .catch(error => {
      res.status(500).send(error.toString());
    });
});


module.exports = router;