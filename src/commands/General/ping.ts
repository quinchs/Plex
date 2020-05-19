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
    async run(message: Message, _args, _data) {
        await message.channel.send("Pinging...").then((m: Message) => {
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);
        });
    }
};
