const apiKey = 'AIzaSyCssneg_uP3Ezv2qC_Lbnbl15tkpRDkgHU';
const channelId = 'UCvukZoO33A0UcNI2g8uoxRg';

async function fetchVideoList() {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&type=video&maxResults=50`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items.map(item => ({
        videoId: item.id.videoId,
        thumbnailUrl: item.snippet.thumbnails.maxres?.url ||
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.default?.url
    }));
}

async function fetchVideoDescription(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=snippet`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items[0]?.snippet?.description?.trim() || '';
}

async function fetchChannelDescription() {
    const url = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=snippet`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items[0]?.snippet?.description?.trim() || 'Funny video';
}

async function displayRandomThumbnail() {
    try {
        const videos = await fetchVideoList();
        const random = videos[Math.floor(Math.random() * videos.length)];

        const img = document.getElementById('thumbnail');
        img.onerror = () => {
            img.src = 'default.png';
        };
        img.src = random.thumbnailUrl;

        let description = await fetchVideoDescription(random.videoId);
        if (!description) {
            description = await fetchChannelDescription();
        }

        document.getElementById('description').textContent = description;
    } catch (err) {
        console.error('Failed to fetch data:', err);
        document.getElementById('description').textContent = 'Funny video';
        const img = document.getElementById('thumbnail');
        img.src = '../images/default.jpg';
    }
}

displayRandomThumbnail();
