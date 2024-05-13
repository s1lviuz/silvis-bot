import { CommandInteraction, Client, ApplicationCommandType } from "discord.js";
import { Command } from "@/Command";
import { getVoiceConnection } from "@discordjs/voice";

const Hello: Command = {
    name: "disconnect",
    description: "Disconnects the bot from the voice channel",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply();

        if (!interaction.guildId) {
            return interaction.editReply("This command must be used in a server");
        }

        const connection = getVoiceConnection(interaction.guildId);

        if (!connection) {
            return interaction.editReply("I'm not connected to a voice channel");
        } else {
            connection.destroy();
            return interaction.editReply("Disconnected");
        }
    }
};

export default Hello;