import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "@/Command";
import { getPlayer } from "@/audio-player";
import { setStoppedByCommand } from "./Play";

enum Option {

}

const Stop: Command = {
    name: "stop",
    description: "Stops the player",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply();

        try {
            const player = getPlayer();

            setStoppedByCommand(true);
            
            player.stop();

            return interaction.followUp("Player stopped");
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to stop the player");
        }
    }
};

export default Stop;