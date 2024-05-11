// Require the necessary discord.js classes
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { env } from './env';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import { DeploymentType, deployCommands } from './deploy-commands';
import { generateDependencyReport } from '@discordjs/voice';
console.log(generateDependencyReport());

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
console.log("Bot is starting...");

// When the client is ready, run this code (only once).
ready(client);

// When the client detects an interaction, run this code
interactionCreate(client);

// Deploy commands to Discord
try {
    deployCommands(DeploymentType.GUILD);
} catch (error) {
    console.error(error);
}

// Log in to Discord with your client's token
client.login(env.DISCORD_TOKEN);