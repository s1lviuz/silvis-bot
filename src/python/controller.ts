import { spawn } from 'child_process';

type PythonResponse = {
    data: any;
    isError?: boolean;
}

const parsePythonResponse = (data: string): PythonResponse => {
    try {
        const response = JSON.parse(data);

        if (response.error) {
            return { data: response.error, isError: true }
        }

        return { data: response.data }
    } catch (error) {
        return { data, isError: true }
    }
}

export const getYoutubeLinksFromSpotifyPlaylistUrl = async (url: string) => new Promise<string[]>((resolve, reject) => {
    const python = spawn('python', ['src/python/get-playlist.py', url]);

    python.stdout.on('data', (data) => {
        const response = parsePythonResponse(data.toString());

        if (response.isError) {
            reject(response.data);
        }

        resolve(response.data);
    });

    python.stderr.on('data', (data) => {
        reject(data.toString());
    });
});

export const getYoutubeLinkFromSpotifyUrl = async (url: string) => new Promise<string>((resolve, reject) => {
    const python = spawn('python', ['src/python/get-song.py', url]);

    python.stdout.on('data', (data) => {
        const response = parsePythonResponse(data.toString());

        if (response.isError) {
            reject(response.data);
        }

        resolve(response.data);
    });

    python.stderr.on('data', (data) => {
        reject(data.toString());
    });
});