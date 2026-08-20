const API_KEY = 'sk_13cd253a0155461b8677ac607310a370';
const BASE_URL = 'https://myt-lh.konnn04.dev';

export async function apiFetch(endpoint, options = {}) {
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

export async function getMusicByQuery(query) {
    return await apiFetch(`/api/v1/music/search?q=${encodeURIComponent(query)}&type=track&limit=30`);
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

// Lấy danh sách bài hát nổi bật/thịnh hành cho Trang Chủ (qua Search)
export async function getHomeFeaturedTracks(query = 'vpop hit 2026') {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/music/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
            headers: { 'X-API-Key': API_KEY }
        });
        const data = await response.json();
        return data.success && Array.isArray(data.data) ? data.data : [];
    } catch (error) {
        console.error('Lỗi khi lấy featured tracks:', error);
        return [];
    }
}

// Lấy danh sách bài hát gợi ý theo trackId
export async function getRecommendations(trackId) {
    if (!trackId) return [];
    try {
        const cleanId = trackId.replace('youtube:', '');
        const response = await fetch(`${BASE_URL}/api/v1/music/recommendations/${cleanId}`, {
            headers: { 'X-API-Key': API_KEY }
        });
        const data = await response.json();
        return data.success && Array.isArray(data.data) ? data.data : [];
    } catch (error) {
        console.error('Lỗi khi lấy bài hát gợi ý:', error);
        return [];
    }
}

// Hàm chuyển đổi ID Spotify sang YouTube Video ID
export async function resolveSpotifyToYouTube(spotifyId) {
    if (!spotifyId) return null;
    const cleanId = spotifyId.includes(':') ? spotifyId.split(':').pop() : spotifyId;
    return await apiFetch(`/api/v1/music/resolve/${cleanId}`);
}

// Hàm tạo Token phát nhạc ngắn hạn từ YouTube Video ID
export async function getStreamDownloadToken(ytVideoId) {
    if (!ytVideoId) return null;

    try {
        const token = localStorage.getItem('accessToken');
        const headers = {
            'X-API-Key': API_KEY
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Gửi POST với body là object rỗng {} để tránh lỗi 400 do rỗng body
        const response = await fetch(`${BASE_URL}/api/v1/stream/${ytVideoId}/download-token`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            console.warn(`Download-token API status: ${response.status}`);
            return null;
        }

        const resData = await response.json();
        console.log('Download token response:', resData);
        return resData?.data?.token || resData?.token;
    } catch (error) {
        console.error('Lỗi khi gọi API Download-Token:', error);
        return null;
    }
}

// Hàm gộp lấy link audio trực tiếp
export async function getPlayableAudioUrl(song) {
    if (!song) return null;

    let rawId = song.id || song.sourceId || song._id || song.videoId || '';
    let trackId = rawId.includes(':') ? rawId.split(':').pop() : rawId;
    let ytId = song.youtubeId || (trackId.length === 11 ? trackId : null);

    // Resolve Spotify -> YouTube ID nếu ID không phải 11 ký tự
    if (!ytId || ytId.length !== 11) {
        try {
            const resolveRes = await resolveSpotifyToYouTube(trackId);
            ytId = resolveRes?.youtube?.sourceId
                || resolveRes?.data?.youtube?.sourceId
                || resolveRes?.youtubeId
                || resolveRes?.sourceId
                || resolveRes?.id;
        } catch (err) {
            console.warn('Lỗi Resolve Spotify sang YouTube:', err);
        }
    }

    if (!ytId) {
        console.error('Không tìm thấy YouTube ID cho bài hát này:', song);
        return null;
    }

    console.log('Đã có YouTube ID:', ytId);

    // Lấy Token để phát qua Public Stream
    try {
        const token = await getStreamDownloadToken(ytId);
        if (token) {
            const directUrl = `${BASE_URL}/api/v1/public-stream/download/${token}`;
            console.log('URL Stream thành công:', directUrl);
            return directUrl;
        }
    } catch (err) {
        console.warn('Không lấy được Token, chuyển sang Fallback stream:', err);
    }

    // Fallback: Nếu không sinh được Token, phát trực tiếp qua Stream Proxy
    return `${BASE_URL}/api/v1/stream/${ytId}`;
}