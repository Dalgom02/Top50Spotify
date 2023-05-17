const express = require('express');
const router = express.Router();
const axios = require('axios');


async function getNewAccessToken(req) {
  return new Promise((resolve, reject) => {
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


        resolve(access_token);
      })
      .catch(error => {
        reject(error);
      });
  });
}


async function getSpotifyData(req, url, retryCount = 0) {
  let access_token = req.session.access_token;
  const timeRanges = ['short_term', 'medium_term', 'long_term'];

  try {
    const promises = timeRanges.map(range => {
      return axios({
        method: 'get',
        url: url,
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        params: {
          time_range: range,
          limit: 50,
        },
      });
    });

    const responses = await Promise.all(promises);

    return {
      short_term: responses[0].data,
      medium_term: responses[1].data,
      long_term: responses[2].data,
    };
  } catch (error) {
    if (error.response && error.response.status === 401 && retryCount < 3) {
      // If the error is Unauthorized (401), refresh the access token
      access_token = await getNewAccessToken(req);

      // Try again with the new access token
      return getSpotifyData(req, url, retryCount + 1);
    } else {
      throw error;
    }
  }
}


async function ensureAccessToken(req, res, next) {
    if (!req.session.access_token) {
        try {
            await getNewAccessToken(req);
        } catch (error) {
            return res.status(500).send(error.toString());
        }
    }


    next();
}
 

router.get('/top-artists', ensureAccessToken, async (req, res) => {
  try {
    const data = await getSpotifyData(req, 'https://api.spotify.com/v1/me/top/artists');
    res.json(data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});


router.get('/top-tracks', ensureAccessToken, async (req, res) => {
  try {
    const data = await getSpotifyData(req, 'https://api.spotify.com/v1/me/top/tracks');
    res.json(data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});


module.exports = router;
