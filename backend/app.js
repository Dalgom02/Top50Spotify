require('dotenv').config();
console.log(require('dotenv').config());
console.log(process.env.CLIENT_ID);


const express = require('express');
const session = require('express-session');
const authRoutes = require('./auth');
const apiRoutes = require('./api');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.get('/handle_tokens', function(req, res) {
  const { access_token, refresh_token } = req.query;

  if (!access_token || !refresh_token) {
    return res.status(400).json({ error: 'Missing access or refresh token' });
  }

  // Store the tokens in the session
  req.session.access_token = access_token;
  req.session.refresh_token = refresh_token;

  // Send a simple confirmation message
  res.send('Tokens received and stored.');
});


app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App is listening on port ${port}`));
