import { AudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";

export const getConnection = (interaction: CommandInteraction) => {
    const guild = interaction.guild;
    if (!!guild) {
        const connectionExists = getVoiceConnection(guild.id);
        if (connectionExists) {
            return connectionExists;
        } else {
            const newConnection = joinVoiceChannel({
                channelId: interaction.channelId,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });

            newConnection.on(VoiceConnectionStatus.Ready, () => {
                console.log("Connection is ready");
            });

            newConnection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log("Connection is disconnected");
            });

            newConnection.on(VoiceConnectionStatus.Destroyed, () => {
                console.log("Connection is destroyed");
            });

            newConnection.on(VoiceConnectionStatus.Signalling, () => {
                console.log("Connection is signalling");
            });

            newConnection.on("error", (error) => {
                console.error(error);
            });

            return newConnection;
        }
    }
    return null;
}

export let player: AudioPlayer | null = null;

export const getPlayer = () => {
    if (!player) {
        player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log("Player is idle");
        });

        player.on(AudioPlayerStatus.Playing, () => {
            console.log("Player is playing");
        });

        player.on(AudioPlayerStatus.Paused, () => {
            console.log("Player is paused");
        });

        player.on(AudioPlayerStatus.Buffering, () => {
            console.log("Player is buffering");
        });

        player.on("error", (error) => {
            console.error(error);
        });
    }

    return player;
}