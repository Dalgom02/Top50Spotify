const loginButton = document.getElementById('login-button');
const loginContainer = document.getElementById('login-container');
const dataContainer = document.getElementById('data-container');
const timeRangeSelect = document.getElementById('time-range-select');

const artistsViewContainer = document.getElementById('artists-view-container');
const tracksViewContainer = document.getElementById('tracks-view-container');
const genresViewContainer = document.getElementById('genres-view-container');

// Tabs
const artistsTab = document.getElementById('artists-tab');
const tracksTab = document.getElementById('tracks-tab');
const genresTab = document.getElementById('genres-tab');
const slider = document.querySelector(".slider");


loginButton.addEventListener('click', function() {
    // Here, you'll need to redirect the user to your /auth/login route
    window.location.href = 'http://localhost:3000/auth/login';
  });

window.addEventListener('hashchange', function() {
  if (window.location.hash === '#authenticated') {
    loginContainer.style.display = 'none';
    dataContainer.style.display = 'block';
    updateData();
  } else {
    loginContainer.style.display = 'block';
    dataContainer.style.display = 'none';
  }
}, false);

// Check the hash on page load as well
if (window.location.hash === '#authenticated') {
  loginContainer.style.display = 'none';
  dataContainer.style.display = 'block';
  updateData();
} else {
  loginContainer.style.display = 'block';
  dataContainer.style.display = 'none';
}

timeRangeSelect.addEventListener('change', function() {
    updateData();
});

artistsTab.addEventListener('click', function() {
    updateData();
});

tracksTab.addEventListener('click', function() {
    updateData();
});

genresTab.addEventListener('click', function() {
    updateData();
});

const checkbox = document.getElementById('checkbox');

checkbox.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});


function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

var params = getHashParams();

var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

    async function updateData() {
      const timeRange = timeRangeSelect.value;
      const token = access_token;  // assuming you have the access token
    
      // Map time range to human readable text
      function mapTimeRange(timeRange) {
        switch (timeRange) {
          case 'short_term':
            return 'Last 4 weeks';
          case 'medium_term':
            return 'Last 6 months';
          case 'long_term':
            return 'All time';
          default:
            return '';
        }
      }
    
      // Update the time range displayed in the title of each tab
      document.getElementById('artist-time-range').innerText = mapTimeRange(timeRange);
      document.getElementById('track-time-range').innerText = mapTimeRange(timeRange);
      document.getElementById('genre-time-range').innerText = mapTimeRange(timeRange);
    
      // Call the update view functions
      await updateArtistsView(timeRange, token);
      await updateTracksView(timeRange, token);
      await updateGenresView(timeRange, token);
    }

    
    async function updateArtistsView(time_range, token) {
      const data = await getTopArtists(time_range, token);
      const artists = data[time_range];
    
      let html = '';
      artists.items.forEach((artist, index) => {
          html += `
          <div class="artist-item">
          <img src="${artist.images[0].url}" alt="${artist.name}" />
          <p>${index + 1}. ${artist.name} <a href="${artist.external_urls.spotify}" target="_blank"><img src="spotify-logo.png" alt="Open this artist in Spotify" title="Open this artist in Spotify" /></a></p>
      </div>`;
            });
    
      artistsViewContainer.innerHTML = html;
    }
        
    async function updateTracksView(time_range, token) {
      const data = await getTopTracks(time_range, token);
      const tracks = data[time_range];
    
      let html = '';
      tracks.items.forEach((track, index) => {
          const trackArtists = track.artists.map(artist => artist.name).join(', ');
          html += `
          <div class="track-item">
          <img src="${track.album.images[0].url}" alt="${track.name}" />
          <p>
            <span class="track-rank">${index + 1}.</span>
            <span class="track-name">${track.name}</span>
            <span class="track-artist">${trackArtists}</span>
            <a href="${track.external_urls.spotify}" target="_blank"><img src="spotify-logo.png" alt="Open this track in Spotify" title="Open this track in Spotify" /></a>
          </p>
      </div>`;
            });
    
      tracksViewContainer.innerHTML = html;
    }
                
async function updateGenresView(time_range, token) {
  const data = await getTopArtists(time_range, token);
  const artists = data[time_range];

  // Extract the genres from the artists data and count their frequency
  let genresCount = {};
  artists.items.forEach(artist => {
      artist.genres.forEach(genre => {
          if (genresCount[genre]) {
              genresCount[genre]++;
          } else {
              genresCount[genre] = 1;
          }
      });
  });

  // Sort the genres by their frequency in descending order
  let genres = Object.entries(genresCount).sort((a, b) => b[1] - a[1]);

  // Limit genres to top 5
  genres = genres.slice(0, 5);

  // Create the HTML for the genres view
  let html = '';
  genres.forEach((genre, index) => {
      html += `<p>${index + 1}. ${genre[0]}: ${genre[1]}</p>`;
  });

  genresViewContainer.innerHTML = html;
}
