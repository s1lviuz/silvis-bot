
import { Innertube, Utils, UniversalCache } from 'youtubei.js';
import { VideoInfo } from 'youtubei.js/dist/src/parser/youtube';
import fs from 'fs';
import crypto from 'crypto';

export let youtubei: Innertube | null = null;

export const startYoutubeAPI = async () => {
    try {
        console.log("YouTube API is starting...");
        // Create a new instance of the YouTube API
        const innerTube = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
        console.log("YouTube API is ready!");

        youtubei = innerTube;
    } catch (error) {
        console.error(error);
    }
}

export const getVideoIdFromUrl = async (innertube: Innertube, url: string) => {
    const search = await innertube.resolveURL(url);

    if (search.payload.url) {
        const resolved = await innertube.resolveURL(search.payload.url);
        if (resolved.payload.url) {
            throw new Error('Failed to resolve URL: ' + search.payload.url);
        }

        if (!resolved.payload.videoId) {
            throw new Error('Failed to get video ID from URL: ' + search.payload.url);
        }

        return resolved.payload.videoId as string;
    }

    if (!search.payload.videoId) {
        throw new Error('Failed to get video ID from URL: ' + url);
    }

    return search.payload.videoId as string;
}

export const downloadVideo = async (video: VideoInfo) => {
    console.log(video.basic_info.title);

    const stream = await video.download({
        type: 'audio',
        quality: 'bestefficiency',
        format: 'mp4'
    });

    console.info('Downloading...');

    const uuid = crypto.randomUUID();

    const dir = `./downloads/${uuid}.mp4`;

    if (!fs.existsSync('./downloads')) {
        fs.mkdirSync('./downloads');
    }

    const file = fs.createWriteStream(`${dir}`);

    for await (const chunk of Utils.streamToIterable(stream)) {
        file.write(chunk);
    }

    file.end();

    console.info('Downloaded to ' + dir);

    return dir;
}