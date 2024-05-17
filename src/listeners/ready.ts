import { ActivityType, Client } from "discord.js";
import commands from "../commands";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        client.user.setActivity({
            name: "🎧 /play {url} para tocar música!",
            type: ActivityType.Custom
        });

        try {
            await client.application.commands.set(commands);
        } catch (error) {
            console.error(error);
        }

        console.log(`${client.user.username} is online`);
    });
};