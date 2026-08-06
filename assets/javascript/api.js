const API_KEY = 'sk_13cd253a0155461b8677ac607310a370';
const BASE_URL = 'https://myt-lh.konnn04.dev';

async function apiFetch(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error(`API Fetch Error on ${endpoint}:`, error);
        return null;
    }
}

export async function getMusicByQuery(query) {
    return await apiFetch(`/api/v1/music/search?q=${encodeURIComponent(query)}&type=track&limit=10`);
}

export async function getTrendingMusic() {
    return await apiFetch('/api/v1/music/trending');
}

export async function getHomeDashboard() {
    return await apiFetch('/api/v1/music/home');
}

export async function getPlaylistById(source, id) {
    return await apiFetch(`/api/v1/music/playlists/${source}/${id}`);
}