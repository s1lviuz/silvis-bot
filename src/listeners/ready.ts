import { Client } from "discord.js";
import commands from "../commands";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        try {
            await client.application.commands.set(commands);
        } catch (error) {
            console.error(error);
        }

        console.log(`${client.user.username} is online`);
    });
};