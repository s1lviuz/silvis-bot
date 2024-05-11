// Require the necessary discord.js classes
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { env } from './env';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
console.log("Bot is starting...");

// When the client is ready, run this code (only once).
ready(client);

// When the client detects an interaction, run this code
interactionCreate(client);

// Log in to Discord with your client's token
client.login(env.DISCORD_TOKEN);