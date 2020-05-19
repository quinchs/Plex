import Command from "../../main/Command";
import { Message } from "discord.js";
module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "ping",
            dirname: __dirname,
            enabled: true,
            description: "Gets the ping to me from you",
        });
    }
    async run(message, args, data) {
        await message.chanel.send("Pinging...").then((m: Message) => {
            m.edit(
                `Pong! Latency is ${
                    m.createdTimestamp - message.createdTimestamp
                }ms. API Latency is ${Math.round(this.client.ping)}ms`
            );
        });
    }
};
