const API_KEY = 'sk_13cd253a0155461b8677ac607310a370';
const BASE_URL = 'https://myt-lh.konnn04.dev';

async function apiFetch(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('accessToken');

        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: options.method || 'GET',
            headers: headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUser');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result.success !== false ? (result.data || result) : null;
    } catch (error) {
        console.error(`API Fetch Error on ${endpoint}:`, error);
        return null;
    }
}

async function getMusicByQuery(query) {
    return await apiFetch(`/api/v1/music/search?q=${encodeURIComponent(query)}&type=track&limit=30`);
}

async function getTrendingMusic() {
    return await apiFetch('/api/v1/music/trending');
}

async function getHomeDashboard() {
    return await apiFetch('/api/v1/music/home');
}

async function getPlaylistById(source, id) {
    return await apiFetch(`/api/v1/music/playlists/${source}/${id}`);
}

// Đưa tất cả hàm lên window để bất kỳ file JS nào cũng gọi được
window.apiFetch = apiFetch;
window.getMusicByQuery = getMusicByQuery;
window.getTrendingMusic = getTrendingMusic;
window.getHomeDashboard = getHomeDashboard;
window.getPlaylistById = getPlaylistById;