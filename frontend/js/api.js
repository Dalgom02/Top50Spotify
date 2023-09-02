async function getTopArtists(time_range, token) {
    try {
        const response = await fetch(`https://top50spotifystats.vercel.app/api/top-artists?time_range=${time_range}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('getTopArtists data:', data);  // Add this line
        return data;
    } catch (error) {
        console.error('Error getting top artists:', error);
    }
}

async function getTopTracks(time_range, token) {
    try {
        const response = await fetch(`https://top50spotifystats.vercel.app/api/top-tracks?time_range=${time_range}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('getTopTracks data:', data);  // Add this line
        return data;
    } catch (error) {
        console.error('Error getting top tracks:', error);
    }
}


async function createPlaylist(userId, token, name, uris) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                public: false,
                uris
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating playlist:', error);
    }
}
