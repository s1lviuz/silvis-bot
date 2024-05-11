import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "@/Command";
import { getConnection, getPlayer } from "@/audio-player";

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
        const url = interaction.options.get(Option.URL)?.value as string;

        await interaction.deferReply();

        const connection = getConnection(interaction);

        const player = getPlayer();
    }
};

export default Play;