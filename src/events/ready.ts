/* eslint-disable @typescript-eslint/ban-ts-ignore */
import Plex from "../main/Plex";

module.exports = class {
    client: Plex;
    constructor(client: Plex) {
        this.client = client;
    }

    async run() {
        const client = this.client;
        client.logger.log(`Loading a total of ${client.commands.size} command(s).`, "log");
        client.logger.log(
            `${client.user.tag}, ready to serve ${client.users.cache.size} users in ${
                client.guilds.cache.size
            } servers. Loaded in ${process.uptime()}ms`,
            "ready"
        );
        const status = client.config.status,
            version = require("../../package.json").version;
        let i = 0;
        setInterval(function () {
            const toDisplay =
                status[i].name.replace("{serversCount}", String(client.guilds.cache.size)) +
                " | v" +
                version;
            client.user.setActivity(toDisplay, { type: status[i].type as any });
            if (status[i + 1]) i++;
            else i = 0;
        }, 20000); // Every 20 seconds
    }
};
