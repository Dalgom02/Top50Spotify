require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const authRoutes = require('./auth');
const apiRoutes = require('./api');


const app = express();


// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));


app.use('/auth', authRoutes);
app.use('/api', apiRoutes);


// Redirect root to stats page
app.get('/', (req, res) => {
  res.redirect('/stats');
});

// Serve the stats page
app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/stats.html'));
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App is listening on port ${port}`));
