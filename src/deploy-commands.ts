import { REST, Routes } from "discord.js";
import commands from "./commands";
import { env } from "./env";

export enum DeploymentType {
    GUILD = 'guild',
    GLOBAL = 'global',
}

export const deployCommands = async (type: DeploymentType = DeploymentType.GLOBAL): Promise<void> => {
    const rest = new REST().setToken(env.DISCORD_TOKEN);

    try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

        let data: any[]

		if (type === DeploymentType.GUILD) {
            console.log(`Deploying commands to guild ${env.DISCORD_GUILD_ID}`);
            data = await rest.put(
                Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
                { body: commands }
            ) as any[];
        } else {
            console.log(`Deploying commands globally`);
            data = await rest.put(
                Routes.applicationCommands(env.DISCORD_CLIENT_ID),
                { body: commands }
            ) as any[];
        }

		console.log(`Successfully reloaded ${data?.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
}