import { CommandInteraction, Client, Interaction, Collection } from "discord.js";
import commands from "../commands";

const cooldowns = new Collection<string, Collection<string, number>>();

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            if (!cooldowns.has(interaction.commandName)) {
                cooldowns.set(interaction.commandName, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(interaction.commandName);
            const cooldownAmount = commands.find(c => c.name === interaction.commandName)?.cooldown || 3;

            const cooldown = timestamps?.get(interaction.user.id);
            if (cooldown) {
                const expirationTime = cooldown + cooldownAmount * 1000;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    await interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${interaction.commandName}\` command.`, ephemeral: true });
                    return;
                }
            }

            await handleSlashCommand(client, interaction);

            timestamps?.set(interaction.user.id, now);
            setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount * 1000);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    const slashCommand = commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        interaction.followUp({ content: "An error has occurred" });
        return;
    }

    slashCommand.run(client, interaction);
};