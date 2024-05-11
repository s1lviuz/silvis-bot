import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "@/Command";
import { getConnection, getPlayer } from "@/audio-player";
import { downloadVideo, getVideoIdFromUrl } from "@/lib/youtubei";
import { youtubei } from "@/lib/youtubei";

enum Option {
    URL = "url",
}

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
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply();

        if (!youtubei) {
            return interaction.followUp("YouTube API is not ready");
        }

        const url = interaction.options.get(Option.URL)?.value as string;

        const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
        const isUrl = urlRegex.test(url);

        if (!isUrl) {
            return interaction.followUp("Invalid URL");
        }

        try {
            const videoId = await getVideoIdFromUrl(youtubei, url);

            const video = await youtubei.getInfo(videoId);

            await downloadVideo(video);

            // const connection = getConnection(interaction);

            // const player = getPlayer();
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to play the video");
        }
    }
};

export default Play;