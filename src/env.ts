import { z } from 'zod';

const envSchema = z.object({
    DISCORD_TOKEN: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_GUILD_ID: z.string(),
    DEPLOYMENT_TYPE: z.enum(['guild', 'global']),
});

export const env = envSchema.parse(process.env);