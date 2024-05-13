import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "@/Command";
import { getPlayer } from "@/audio-player";
import { setStoppedByCommand } from "./Play";
import { AudioPlayerStatus } from "@discordjs/voice";

enum Option {

}

const Skip: Command = {
    name: "skip",
    description: "Skips the current audio",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply();

        try {
            const player = getPlayer();

            if (!(player.state.status === AudioPlayerStatus.Playing)) {
                return interaction.followUp("I'm not reproducing anything right now");
            }
            
            player.stop();

            return interaction.followUp("Audio skipped");
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to skip the audio");
        }
    }
};

export default Skip;