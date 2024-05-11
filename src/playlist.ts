
interface VideoInfo {
    id: string;
    title: string;
    dir: string;
    prevId?: string;
    nextId?: string;
}

interface Playlist {
    name: string;
    videos: VideoInfo[];
}

export let playlists: Playlist[] = [];