import { getHomeFeaturedTracks, getRecommendations } from './api.js';
import { setPlayQueue } from './music-player.js';
import { toggleLikeSong, isSongLiked } from './favorite.js';

export async function initHomePage() {
    const heroTitle = document.getElementById('hero-title');
    const heroArtist = document.getElementById('hero-artist');
    const heroThumb = document.getElementById('hero-thumb');
    const heroPlayBtn = document.getElementById('hero-play-btn');
    const trendingGrid = document.getElementById('home-trending-grid');
    const recGrid = document.getElementById('home-recommended-grid');

    if (!trendingGrid) return;

    // Nạp bài hát nổi bật (Featured Tracks)
    try {
        const featuredTracks = await getHomeFeaturedTracks('nhac tre hit');

        if (featuredTracks && featuredTracks.length > 0) {
            const top1Song = featuredTracks[0];
            if (heroTitle) heroTitle.textContent = top1Song.title;
            if (heroArtist) heroArtist.textContent = top1Song.artist || 'Nhiều nghệ sĩ';

            if (heroThumb) {
                heroThumb.src = top1Song.thumbnail || '';
                heroThumb.style.display = 'block';
            }

            if (heroPlayBtn) {
                heroPlayBtn.onclick = () => setPlayQueue(featuredTracks, 0);
            }

            // Render 6 bài nổi bật với class .favorite-btn
            const topTracks = featuredTracks.slice(0, 6);
            trendingGrid.innerHTML = topTracks.map((song, idx) => {
                const songId = song.id || song.sourceId;
                const liked = isSongLiked(songId);
                return `
                    <div class="home-trend-card" data-trend-idx="${idx}">
                        <div class="home-trend-card-left">
                            <span class="home-trend-rank">${idx + 1}</span>
                            <img src="${song.thumbnail || ''}" class="home-trend-thumb" alt="${song.title}">
                            <div class="home-trend-meta">
                                <h4 class="home-trend-title">${song.title}</h4>
                                <p class="home-trend-artist">${song.artist || 'Unknown'}</p>
                            </div>
                        </div>
                        <button class="favorite-btn${liked ? ' active' : ''}" data-trend-fav="${idx}" title="${liked ? 'Bỏ yêu thích' : 'Yêu thích'}">
                            <i class="${liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
                        </button>
                    </div>
                `;
            }).join('');

            // Gán sự kiện click phát nhạc & yêu thích
            trendingGrid.querySelectorAll('.home-trend-card').forEach(el => {
                el.onclick = (e) => {
                    if (e.target.closest('.favorite-btn')) return;
                    const idx = parseInt(el.getAttribute('data-trend-idx'), 10);
                    setPlayQueue(featuredTracks, idx);
                };

                const favBtn = el.querySelector('.favorite-btn');
                if (favBtn) {
                    favBtn.onclick = (e) => {
                        e.stopPropagation();
                        const idx = parseInt(favBtn.getAttribute('data-trend-fav'), 10);
                        const targetSong = topTracks[idx];
                        const isLikedNow = toggleLikeSong(targetSong);

                        favBtn.classList.toggle('active', isLikedNow);
                        favBtn.title = isLikedNow ? 'Bỏ yêu thích' : 'Yêu thích';

                        const icon = favBtn.querySelector('i');
                        if (icon) {
                            icon.className = isLikedNow ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                            icon.style.transform = 'scale(1.3)';
                            setTimeout(() => {
                                icon.style.transform = 'scale(1)';
                            }, 150);
                        }
                    };
                }
            });
        } else {
            trendingGrid.innerHTML = '<div class="home__loading">Không thể tải bài hát nổi bật lúc này.</div>';
        }

        // 2. Nạp gợi ý (Recommendations)
        const seedId = (featuredTracks && featuredTracks[0]?.sourceId) || '7qiZfU4dY1WllzX7mPBI3';
        const recTracks = await getRecommendations(seedId);

        if (recGrid) {
            if (recTracks && recTracks.length > 0) {
                recGrid.innerHTML = recTracks.slice(0, 12).map((song, idx) => `
                    <div class="home-rec-card" data-rec-idx="${idx}">
                        <div class="home-rec-thumb-box">
                            <img src="${song.thumbnail || ''}" class="home-rec-thumb" alt="${song.title}">
                        </div>
                        <h4 class="home-rec-title">${song.title}</h4>
                        <p class="home-rec-artist">${song.artist || 'Unknown'}</p>
                    </div>
                `).join('');

                recGrid.querySelectorAll('.home-rec-card').forEach(el => {
                    el.onclick = () => {
                        const idx = parseInt(el.getAttribute('data-rec-idx'), 10);
                        setPlayQueue(recTracks, idx);
                    };
                });
            } else {
                recGrid.innerHTML = '<div class="home__loading">Không có gợi ý khả dụng.</div>';
            }
        }
    } catch (err) {
        console.error('Lỗi khởi tạo Home Page:', err);
    }
}

window.initHomePage = initHomePage;

if (document.getElementById('home-trending-grid')) {
    initHomePage();
}