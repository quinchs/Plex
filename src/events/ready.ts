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
        const status = require("../config.ts").status,
            version = require("../../package.json").version;
        let i = 0;
        setInterval(function () {
            const toDisplay =
                //@ts-ignore
                status[parseInt(i, 10)].name.replace("{serversCount}", client.guilds.cache.size) +
                " | v" +
                version;
            //@ts-ignore
            client.user.setActivity(toDisplay, { type: status[parseInt(i, 10)].type });
            //@ts-ignore
            if (status[parseInt(i + 1, 10)]) i++;
            else i = 0;
        }, 20000); // Every 20 seconds
    }
};
