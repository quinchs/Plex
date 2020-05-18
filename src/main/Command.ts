/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* @ts-ignore */
import path from "path";

export default class Command {
    help: { name: null; description: any; category: any; usage: any; examples: any };
    conf: {
        enabled: boolean;
        guildOnly: boolean;
        aliases: [];
        memberPermissions: [];
        botPermissions: [];
        nsfw: boolean;
    };
    client: any;
    constructor(
        client: any,
        {
            name = null,
            dirname = false,
            enabled = true,
            guildOnly = false,
            description = null,
            usage = null,
            examples = null,
            aliases = [],
            botPermissions = [],
            memberPermissions = [],
            nsfw = false,
        }: any
    ) {
        //@ts-ignore
        // eslint-disable-next-line prettier/prettier
        const category = dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length - 1, 10)]
            : "Other";
        this.client = client;
        this.conf = {
            enabled,
            guildOnly,
            aliases,
            memberPermissions,
            botPermissions,
            nsfw,
        };
        this.help = { name, description, category, usage, examples };
    }
}
