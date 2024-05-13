import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "@/Command";
import { getConnection, getPlayer } from "@/audio-player";
import { downloadVideo, getVideoIdFromUrl, getVideosFromPlaylist } from "@/lib/youtubei";
import { youtubei } from "@/lib/youtubei";
import { AudioPlayer, AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { join } from "path";
import crypto from "crypto";
import fs from "fs";
import { getYoutubeLinkFromSpotifyUrl, getYoutubeLinksFromSpotifyPlaylistUrl } from "@/python/controller";

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
        console.log("Video finished");
        resolve(true);
    });

    player.on("error", (error) => {
        console.error(error);
        resolve(false);
    });
});

const getAudioResource = (dir: string) => {
    const resource = createAudioResource(join('/usr/src/app', dir), { inlineVolume: true });
    resource.volume?.setVolume(0.25);

    return resource;
}

const Play: Command = {
    name: "play",
    description: "Reproduces a audio from a youtube or spotify link",
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
            description: "If the link is a playlist",
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
            return interaction.followUp("Player unpaused");
        }

        if (player.state.status === AudioPlayerStatus.Playing) {
            return interaction.followUp("Already playing something");
        }

        if (stoppedByCommand) {
            setStoppedByCommand(false);
        }

        if (!youtubei) {
            return interaction.followUp("YouTube API is not ready");
        }

        const url = interaction.options.get(Option.URL)?.value as string;
        const isPlaylist = interaction.options.get(Option.PLAYLIST)?.value as boolean || false;

        const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
        const spRegex = /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com)\/(.+)/;
        const urlRegex = new RegExp(`(${ytRegex.source})|(${spRegex.source})`);
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
                const isSpotifyPlaylist = url.includes("spotify");

                const videos = isSpotifyPlaylist ? await getYoutubeLinksFromSpotifyPlaylistUrl(url) : await getVideosFromPlaylist(youtubei, url);

                interaction.followUp(`Reproducing ${videos.length} items from the playlist`);

                const verifyTextChannelAcess = interaction.guild?.members.me?.permissionsIn(interaction.channelId).has(PermissionFlagsBits.SendMessages);

                for await (const video of videos) {
                    if (stoppedByCommand) {
                        console.log("Stopped by command");
                        return;
                    }
                    try {
                        const videoInfo = await youtubei.getInfo(typeof video === "string" ? await getVideoIdFromUrl(youtubei, video) : video.id);

                        const dir = await downloadVideo(videoInfo, crypto.randomUUID());

                        const resource = getAudioResource(dir);

                        connection.subscribe(player);

                        player.play(resource);

                        if (verifyTextChannelAcess)
                            interaction.channel?.send(`Playing ${videoInfo.basic_info.title}`);

                        const reproduced = await videoReproducedPromisse(player);

                        fs.unlinkSync(join('/usr/src/app', dir));

                        if (!reproduced) {
                            return;
                        }

                        if (videos.length === 0) {
                            if (verifyTextChannelAcess)
                                return interaction.channel?.send("Playlist finished");
                        }

                        console.log("Next video");
                    } catch (error) {
                        console.error(error);
                        if (verifyTextChannelAcess)
                            interaction.channel?.send("Failed to play the video");
                        break;
                    }
                }
            } else {
                const isSpotify = url.includes("spotify");

                const videoId = await getVideoIdFromUrl(youtubei, isSpotify ? await getYoutubeLinkFromSpotifyUrl(url) : url);

                const video = await youtubei.getInfo(videoId);

                const uuid = crypto.randomUUID();

                const dir = await downloadVideo(video, uuid);

                const resource = getAudioResource(dir);

                connection.subscribe(player);

                player.play(resource);

                videoReproducedPromisse(player).then((reproduced) => {
                    fs.unlinkSync(join('/usr/src/app', dir));
                });

                return interaction.followUp(`Playing ${video.basic_info.title}`);
            }
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to play the link");
        }
    }
};

export default Play;