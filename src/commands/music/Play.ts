import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, APIEmbed } from "discord.js";
import { Command } from "@/Command";
import { getConnection, getPlayer } from "@/audio-player";
import { downloadVideo, getVideoIdFromUrl, getVideosFromPlaylist } from "@/lib/youtubei";
import { youtubei } from "@/lib/youtubei";
import { AudioPlayer, AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { join } from "path";
import crypto from "crypto";
import fs from "fs";
import { getYoutubeLinkFromSpotifyUrl, getYoutubeLinksFromSpotifyPlaylistUrl } from "@/python/controller";
import { VideoInfo } from "youtubei.js/dist/src/parser/youtube";
import { format } from "date-fns";

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
    resource.volume?.setVolume(0.1);

    return resource;
}

const createPlayingEmbed = (video: VideoInfo) => {
    const bestThumbnail = video.basic_info.thumbnail?.sort((a, b) => b.width - a.width)[0].url ?? '';

    return {
        title: video.basic_info.title,
        author: {
            name: video.basic_info.author ?? "Unknown",
        },
        description: video.basic_info.short_description,
        thumbnail: {
            url: bestThumbnail,
        },
        fields: [
            {
                name: "Channel",
                value: `[${video.basic_info.channel?.name}](${video.basic_info.channel?.url})`,
                inline: true,
            },
            {
                name: "Views",
                value: video.basic_info.view_count?.toLocaleString() ?? "Unknown",
                inline: true,
            },
            {
                name: "Duration",
                value: video.basic_info.duration ? new Date(video.basic_info.duration * 1000).toISOString().substr(11, 8) : "Unknown",
                inline: true,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: "Playing",
        }
    } satisfies APIEmbed;
}

const verifyPlaylist = (url: string) => {
    const spotify = url.toLowerCase().includes("playlist");
    const youtube = url.toLowerCase().includes("list");

    return spotify || youtube;
}

const Play: Command = {
    name: "play",
    description: "Reproduz uma música ou playlist no seu canal de voz",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    options: [
        {
            name: Option.URL,
            description: "URL da música ou playlist",
            type: ApplicationCommandOptionType.String,
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply();

        const player = getPlayer();

        if (!player) {
            return interaction.followUp({
                embeds: [{
                    title: "⚠️ Player musical não encontrado",
                    description: "Tente conectar ao canal de voz novamente",
                }]
            });
        }

        if (player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();
            return interaction.followUp({
                embeds: [{
                    title: "▶️ Player musical despausado",
                }]
            });
        }

        if (player.state.status === AudioPlayerStatus.Playing) {
            return interaction.followUp({
                embeds: [{
                    title: "⏸️ Player musical já está reproduzindo",
                    description: "Pause o player musical antes de reproduzir outra música",
                    fields: [
                        {
                            name: "Comando de pausa",
                            value: "/pause",
                        },
                    ]
                }]
            });
        }

        if (stoppedByCommand) {
            setStoppedByCommand(false);
        }

        if (!youtubei) {
            return interaction.followUp({
                embeds: [{
                    title: "⚠️ Erro ao carregar a API do Youtube",
                    description: "Tente novamente mais tarde",
                }]
            });
        }

        const url = interaction.options.get(Option.URL)?.value as string;

        const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
        const spRegex = /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com)\/(.+)/;
        const urlRegex = new RegExp(`(${ytRegex.source})|(${spRegex.source})`);
        const isUrl = urlRegex.test(url);

        if (!isUrl) {
            return interaction.followUp({
                embeds: [{
                    title: "⚠️ URL inválida",
                    description: "A URL informada não é válida",
                    fields: [
                        {
                            name: "Formato esperado",
                            value: "https://www.youtube.com/watch?v=VIDEO_ID",
                        },
                        {
                            name: "Formato esperado",
                            value: "https://open.spotify.com/playlist/PLAYLIST_ID",
                        },
                    ]
                }]
            });
        }

        const isPlaylist = verifyPlaylist(url);

        try {
            const connection = getConnection(interaction);

            if (!connection) {
                return interaction.followUp({
                    embeds: [{
                        title: "⚠️ Conexão não encontrada",
                        description: "Conecte ao canal de voz para reproduzir músicas",
                    }]
                });
            }

            if (isPlaylist) {
                const isSpotifyPlaylist = url.includes("spotify");

                const videos = isSpotifyPlaylist ? await getYoutubeLinksFromSpotifyPlaylistUrl(url) : await getVideosFromPlaylist(youtubei, url);

                interaction.followUp({
                    embeds: [{
                        title: "🎵 Playlist adicionada",
                        description: `Playlist com ${videos.length} músicas adicionada`,
                        fields: [
                            {
                                name: "Data",
                                value: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
                            },
                        ]
                    }]
                });

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
                            interaction.channel?.send({ embeds: [createPlayingEmbed(videoInfo)] });

                        const reproduced = await videoReproducedPromisse(player);

                        fs.unlinkSync(join('/usr/src/app', dir));

                        if (!reproduced) {
                            return;
                        }

                        if (videos.length === 0) {
                            if (verifyTextChannelAcess)
                                return interaction.channel?.send({
                                    embeds: [{
                                        title: "🎵 Playlist finalizada",
                                        description: "Todas as músicas da playlist foram reproduzidas",
                                    }]
                                });
                        }

                        console.log("Next video");
                    } catch (error) {
                        console.error(error);
                        if (verifyTextChannelAcess)
                            interaction.channel?.send({
                                embeds: [{
                                    title: "⚠️ Erro ao reproduzir a música",
                                    description: "Ocorreu um erro ao reproduzir a música",
                                }]
                            });
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

                return interaction.followUp({ embeds: [createPlayingEmbed(video)] });
            }
        } catch (error) {
            console.error(error);
            return interaction.followUp({
                embeds: [{
                    title: "⚠️ Erro ao reproduzir a música",
                    description: "Ocorreu um erro ao reproduzir a música",
                }]
            });
        }
    }
};

export default Play;