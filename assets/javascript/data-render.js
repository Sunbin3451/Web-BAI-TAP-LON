export function renderSongGrid(tracks, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !tracks) return;

    container.innerHTML = tracks.map(track => {
        const thumbnail = track.thumbnail || track.cover || 'assets/images/default-cover.jpg';
        return `
            <div class="song-card" data-id="${track.id}">
                <div class="song-image-box">
                    <img src="${thumbnail}" alt="${track.title}" class="song-cover" />
                </div>
                <div class="song-info">
                    <h4 class="song-title">${track.title || 'Unknown Title'}</h4>
                    <p class="song-artist">${track.artist || track.author || 'Unknown Artist'}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Render sidebar playlists
export function renderSidebarPlaylists(playlists, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !playlists) return;

    container.innerHTML = playlists.map(pl => `
        <li class="playlist-item" data-id="${pl.id}">
            <span class="playlist-name">${pl.title || pl.name}</span>
        </li>
    `).join('');
}