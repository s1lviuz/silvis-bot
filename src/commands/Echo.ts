import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "../Command";

enum Option {
    Input = "input",
    Private = "private",
    Ephemeral = "ephemeral"
}

const Echo: Command = {
    name: "echo",
    description: "Replies with your input!",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    options: [
        {
            name: Option.Input,
            description: "The input to echo back",
            type: ApplicationCommandOptionType.String,
        },
        {
            name: Option.Ephemeral,
            description: "Whether to reply with ephemeral",
            type: ApplicationCommandOptionType.Boolean
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = interaction.options.get(Option.Input)?.value || "You didn't provide any input!";
        const isEphemeral = interaction.options.get(Option.Ephemeral)?.value as boolean || false;

        await interaction.deferReply({ ephemeral: isEphemeral });
        await interaction.followUp({
            content: content.toString()
        });
    }
};

export default Echo;