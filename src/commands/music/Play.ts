import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "@/Command";
import { getConnection, getPlayer } from "@/audio-player";
import { downloadVideo, getPlaylistIdFromUrl, getVideoIdFromUrl } from "@/lib/youtubei";
import { youtubei } from "@/lib/youtubei";
import { AudioPlayer, AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { join } from "path";
import crypto from "crypto";
import fs from "fs";

export let stoppedByCommand = false;

export const setStoppedByCommand = (value: boolean) => {
    stoppedByCommand = value;
}

enum Option {
    URL = "url",
    PLAYLIST = "playlist",
}

const videoReproducedPromisse = (player: AudioPlayer) => new Promise<boolean>((resolve, reject) => {
    player.on(AudioPlayerStatus.Idle, () => {
        if (stoppedByCommand) {
            stoppedByCommand = false;
            resolve(false);
        }

        resolve(true);
    });

    player.on("error", (error) => {
        console.error(error);
        resolve(false);
    });
});


const Play: Command = {
    name: "play",
    description: "Reproduces a youtube link (only audio)",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    options: [
        {
            name: Option.URL,
            description: "The youtube link to reproduce",
            type: ApplicationCommandOptionType.String,
        },
        {
            name: Option.PLAYLIST,
            description: "If the video is part of a playlist",
            type: ApplicationCommandOptionType.Boolean,
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply();

        const player = getPlayer();

        if (!player) {
            return interaction.followUp("Failed to get the player");
        }

        if (player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();
            return interaction.followUp("Video unpaused");
        }

        if (player.state.status === AudioPlayerStatus.Playing) {
            return interaction.followUp("Already playing a video");
        }

        if (stoppedByCommand) {
            setStoppedByCommand(false);
        }

        if (!youtubei) {
            return interaction.followUp("YouTube API is not ready");
        }

        const url = interaction.options.get(Option.URL)?.value as string;
        const isPlaylist = interaction.options.get(Option.PLAYLIST)?.value as boolean || false;

        const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
        const isUrl = urlRegex.test(url);

        if (!isUrl) {
            return interaction.followUp("Invalid URL");
        }

        try {
            const connection = getConnection(interaction);

            if (!connection) {
                return interaction.followUp("Not connected to a voice channel");
            }

            if (isPlaylist) {
                const playlistId = await getPlaylistIdFromUrl(youtubei, url);

                const playlist = await youtubei.getPlaylist(playlistId);

                const videos = playlist.items.map((video) => ({ ...video, uuid: crypto.randomUUID() }));

                for await (const video of videos) {
                    try {
                        const videoInfo = await youtubei.getInfo(video.id);

                        const dir = await downloadVideo(videoInfo, video.uuid);

                        const resource = createAudioResource(join('/usr/src/app', dir));

                        connection.subscribe(player);

                        player.play(resource);

                        interaction.followUp(`Playing ${video.title.text}`);

                        const reproduced = await videoReproducedPromisse(player);

                        fs.unlinkSync(join('/usr/src/app', dir));

                        if (!reproduced) {
                            return;
                        }

                        if (videos.length === 0) {
                            return interaction.followUp("Playlist finished");
                        }

                        console.log("Next video");
                    } catch (error) {
                        console.error(error);
                        interaction.followUp("Failed to reproduce the video");
                        break;
                    }
                }
            } else {
                const videoId = await getVideoIdFromUrl(youtubei, url);

                const video = await youtubei.getInfo(videoId);

                const uuid = crypto.randomUUID();

                const dir = await downloadVideo(video, uuid);

                const resource = createAudioResource(join('/usr/src/app', dir));

                connection.subscribe(player);

                player.play(resource);

                videoReproducedPromisse(player).then((reproduced) => {
                    fs.unlinkSync(join('/usr/src/app', dir));
                });

                return interaction.followUp(`Playing ${video.basic_info.title}`);
            }
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to play the video");
        }
    }
};

export default Play;