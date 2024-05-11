import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "@/Command";
import { getPlayer } from "@/audio-player";
import { setStoppedByCommand } from "./Play";

enum Option {

}

const Skip: Command = {
    name: "skip",
    description: "Skips the current video",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply();

        try {
            const player = getPlayer();

            if (!player) {
                return interaction.followUp("I'm not reproducing anything right now");
            }
            
            player.stop();

            return interaction.followUp("Video skipped");
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to skip the video");
        }
    }
};

export default Skip;