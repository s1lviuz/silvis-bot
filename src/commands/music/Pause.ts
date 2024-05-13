import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "@/Command";
import { getPlayer } from "@/audio-player";
import { AudioPlayerStatus } from "@discordjs/voice";

enum Option {

}

const Pause: Command = {
    name: "pause",
    description: "Pauses the player if it's reproducing something",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.deferReply();

        try {
            const player = getPlayer();

            if (!(player.state.status === AudioPlayerStatus.Playing)) {
                return interaction.followUp("I'm not reproducing anything right now");
            }

            player.pause();

            return interaction.followUp("Video paused");
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to pause the video");
        }
    }
};

export default Pause;