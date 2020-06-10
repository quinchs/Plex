import Command from "../../main/Command";
import { Message } from "discord.js";
import Plex from "../../main/Plex";
/**
 * Ping command, Gets ping
 * @extends Command
 */
module.exports = class extends Command {
    /**
     * @param client
     */
    client: Plex;
    constructor(client: Plex) {
        super(client, {
            name: "ping",
            dirname: __dirname,
            enabled: true,
            description: "Gets the ping to me from you",
        });
    }
    async run(message: Message) {
        await message.channel.send("Pinging...").then((m: Message) => {
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);
            this.client.logger.log(
                `Pinged. Ping: ${m.createdTimestamp - message.createdTimestamp}`,
                "log"
            );
        });
    }
};
