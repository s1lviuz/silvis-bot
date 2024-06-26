import { Client, GatewayIntentBits, REST } from 'discord.js';
import { env } from './env';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import { deployCommands } from './deploy-commands';
import { startYoutubeAPI } from '@/lib/youtubei';

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
console.log("Bot is starting...");

// When the client is ready, run this code (only once).
ready(client);

// When the client detects an interaction, run this code
interactionCreate(client);

// Create a new REST instance
export const discordRestApi = new REST().setToken(env.DISCORD_TOKEN);

// Deploy commands to Discord
try {
    deployCommands(env.DEPLOYMENT_TYPE);
} catch (error) {
    console.error(error);
}

// Log in to Discord with your client's token
client.login(env.DISCORD_TOKEN);

// Create a new instance of the YouTube API
startYoutubeAPI();