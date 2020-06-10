/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import Plex from "./Plex";
/**
 * The Default Command Class
 * @param {Plex} Client - The bots client
 * @param {Object} command - Command options
 * @param {string} command.name - Name of the command
 * @param {string} command.dirname - The dirname. Use __dirname
 * @param {boolean} command.enabled - If the command is enabled
 * @param {boolean} command.guildOnly - If the command is guild only
 * @param {string} command.description - The description of the command
 * @param {string} command.usage - How to use the command
 * @param {string} command.examples - Examples of the command
 * @param {Array} command.aliases - Aliases of the command
 * @param {Array} command.botPermissions - Permissions needed of the bot for the command to work
 * @param {Array} command.memberPermissions - Permissions needed by the user
 * @param {boolean} command.nsfw - If the command is nsfw
 */
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
        client: Plex,
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
        // eslint-disable-next-line prettier/prettier
        const category = dirname
            ? dirname.split(path.sep)[dirname.split(path.sep).length - 1]
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
