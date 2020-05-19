/* eslint-disable @typescript-eslint/ban-ts-ignore */
import Disocrd from "discord.js";

module.exports = class {
    client: any;
    constructor(client) {
        this.client = client;
    }

    async run() {
        const client = this.client;

        // Logs some informations using the logger file
        client.logger.log(`Loading a total of ${client.commands.size} command(s).`, "log");
        client.logger.log(
            `${client.user.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`,
            "ready"
        );
        const status = client.config.status,
            version = require("../../package.json").version;
        let i = 0;
        setInterval(function () {
            const toDisplay =
                status[i].name.replace("{serversCount}", client.guilds.cache.size) +
                " | v" +
                version;
            client.user.setActivity(toDisplay, { type: status[i].type });
            if (status[i + 1]) i++;
            else i = 0;
        }, 20000); // Every 20 seconds
    }
};
