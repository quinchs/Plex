/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
const xpCooldown = {};
import Plex from "../main/Plex";
import { Message, GuildChannel, TextChannel } from "discord.js";

module.exports = class {
    client: Plex;
    data: any;
    constructor(client: Plex) {
        this.client = client;
    }
    async run(message: Message) {
        if (message.author.bot) return;

        if (message.guild && !message.member) {
            await message.guild.members.fetch(message.author.id);
        }

        if (message.guild) {
            const guild = await this.client.findOrCreateGuild({ id: message.guild.id });
            this.data.guild = guild;
        }

        if (message.content.match(new RegExp(`^<@!?${this.client.user.id}>( |)$`))) {
            return message.reply(`My prefix is ${this.data.guild.prefix}`);
        }
        if (message.guild) {
            // Gets the data of the member
            const memberData = await this.client.findOrCreateMember({
                id: message.author.id,
                guildID: message.guild.id,
            });
            this.data.member = memberData;
        }
        const userData = await this.client.findOrCreateUser({ id: message.author.id });
        this.data.user = userData;
        if (message.guild) {
            await updateXp(message, this.data);
        }
        if (
            this.data.guild.plugins.autoMod.enabled &&
            !this.data.guild.plugins.autoMod.ignored.includes(message.channel.id)
        ) {
            if (/(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(message.content)) {
                const channel = message.channel as GuildChannel;
                if (!channel.permissionsFor(message.member).has("MANAGE_MESSAGES")) {
                    this.client.logger.log(
                        `Auto moderated a message. Message: ${message.content}. Server: ${message.guild.name}. User: ${message.author.tag}`,
                        "warn"
                    );
                    message.delete();
                    return message.author.send("```" + message.content + "```");
                }
            }
        }
        const afkReason = this.data.user.afk;
        if (afkReason) {
            this.data.user.afk = null;
            await this.data.user.save();
            message.channel.send(`Afk turned off for ${message.author.tag}`);
        }
        message.mentions.users.forEach(async (u) => {
            const userData: any = await this.client.findOrCreateUser({ id: u.id });
            if (userData.afk) {
                message.channel.send("That user is afk");
            }
        });
        const prefix: any = await getPrefix(message, this.data, this.client);
        if (!prefix) return;
        const args = message.content
            .slice(typeof prefix === "string" ? prefix.length : 0)
            .trim()
            .split(/ +/g);
        const command = args.shift().toLowerCase();
        const cmd =
            this.client.commands.get(command) ||
            this.client.commands.get(this.client.aliases.get(command));
        if (!cmd) return;
        if (cmd.conf.guildOnly && !message.guild) {
            this.client.logger.log(
                `Guild only command used in dm. Command: ${message.content}. User: ${message.author.tag}`,
                "warn"
            );
            return message.channel.send("That command is only usable in guilds");
        }

        if (message.guild) {
            const channel = message.channel as GuildChannel;
            let neededPermission = [];
            if (!cmd.conf.botPermissions.includes("EMBED_LINKS")) {
                cmd.conf.botPermissions.push("EMBED_LINKS");
            }
            cmd.conf.botPermissions.forEach((perm) => {
                if (!channel.permissionsFor(message.guild.me).has(perm)) {
                    neededPermission.push(perm);
                }
            });
            if (neededPermission.length > 0) {
                message.channel.send(
                    "I need the following permissions to perform this command:" +
                        neededPermission.map((p) => `\`${p}\``).join(", ")
                );
                return this.client.logger.log(
                    `Unable to send a message due to permission constraints. Command: ${
                        message.content
                    }. Needed Perms: ${neededPermission}. User: ${message.author.tag}. ${
                        message.guild ? message.guild.name : "In dms"
                    }`,
                    "warn"
                );
            }
            neededPermission = [];
            cmd.conf.memberPermissions.forEach((perm) => {
                if (!channel.permissionsFor(message.member).has(perm)) {
                    neededPermission.push(perm);
                }
            });
            if (neededPermission.length > 0) {
                message.channel.send(
                    "You need the following permissions to perform this command:" +
                        neededPermission.map((p) => `\`${p}\``).join(", ")
                );
                return this.client.logger.log(
                    `Unable to send a message due to a user not having permission. Command: ${
                        message.content
                    }. Needed Perms: ${neededPermission}. User: ${message.author.tag}. ${
                        message.guild ? message.guild.name : "In dms"
                    }`,
                    "warn"
                );
            }
            if (
                this.data.guild.ignoredChannels.includes(message.channel.id) &&
                !message.member.hasPermission("MANAGE_MESSAGES")
            ) {
                message.delete() &&
                    message.author.send("Commands are forbidden in " + message.channel);
                return this.client.logger.log(
                    `Unable to send a message due to the channel being ignored. Command: ${
                        message.content
                    }. User: ${message.author.tag}. ${
                        message.guild ? message.guild.name : "In dms"
                    }`,
                    "warn"
                );
            }

            if (
                !channel.permissionsFor(message.member).has("MENTION_EVERYONE") &&
                (message.content.includes("@everyone") || message.content.includes("@here"))
            ) {
                message.channel.send(
                    "You are not allowed to mention everyone or here in the commands."
                );
                return this.client.logger.log(
                    `Unable to send a message due to @everyone permission constraints. Command: ${
                        message.content
                    }. User: ${message.author.tag}. ${
                        message.guild ? message.guild.name : "In dms"
                    }`,
                    "warn"
                );
            }
            if (!(channel as TextChannel).nsfw && cmd.conf.nsfw) {
                message.channel.send(
                    "You must go to in a channel that allows the NSFW to type this command!"
                );
                return this.client.logger.log(
                    `Unable to send a message due to it not being a nsfw channel. Command: ${
                        message.content
                    }. User: ${message.author.tag}. ${
                        message.guild ? message.guild.name : "In dms"
                    }`,
                    "warn"
                );
            }
        }

        if (!cmd.conf.enabled) {
            message.channel.send("This command is currently disabled!");
            return this.client.logger.log(
                `Unable to send a message due to the command being disabled. Command: ${
                    message.content
                }. User: ${message.author.tag}. ${message.guild ? message.guild.name : "In dms"}`,
                "warn"
            );
        }

        this.client.logger.log(
            `${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`,
            "cmd"
        );
        const log = new this.client.logs({
            commandName: cmd.help.name,
            author: {
                username: message.author.username,
                discriminator: message.author.discriminator,
                id: message.author.id,
            },
            guild: {
                name: message.guild ? message.guild.name : "dm",
                id: message.guild ? message.guild.id : "dm",
            },
        });
        log.save();

        try {
            cmd.run(message, args, this.data);
            if (cmd.help.category === "Moderation" && this.data.guild.autoDeleteModCommands) {
                message.delete();
            }
        } catch (e) {
            this.client.logger.log(e, "error");
            return message.channel.send(
                "An error has occurred, please try again in a few minutes."
            );
        }
    }
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function updateXp(
    msg: { author: { id: string | number } },
    data: { guild?: any; member?: any; user?: any }
) {
    // Gets the user information
    const points: number = parseInt(data.member.exp);
    const level: number = parseInt(data.member.level);

    // if the member is already in the cooldown db
    const isInCooldown = xpCooldown[msg.author.id];
    if (isInCooldown) {
        if (isInCooldown > Date.now()) {
            return;
        }
    }
    // Records in the database the time when the member will be able to win xp again (3min)
    const toWait = Date.now() + 60000;
    xpCooldown[msg.author.id] = toWait;

    // Gets a random number between 10 and 5
    const won = Math.floor(Math.random() * (Math.floor(10) - Math.ceil(5))) + Math.ceil(5);
    const newXp = points + won;

    // calculation how many xp it takes for the next new one
    const neededXp = 5 * (level * level) + 80 * level + 100;

    // check if the member up to the next level
    if (newXp > neededXp) {
        data.member.level = level + 1;
    }

    // Update user data
    data.member.exp = newXp;
    await data.member.save();
}

async function getPrefix(
    message: { channel: { type: string }; client: { user: { id: any } }; content: string },
    data: { guild: any; member?: any; user?: any },
    client: { config: { botname: any } }
) {
    if (message.channel.type !== "dm") {
        const prefixes = [`<@${message.client.user.id}>`, client.config.botname, data.guild.prefix];
        let prefix = null;
        prefixes.forEach((p) => {
            if (message.content.startsWith(p)) {
                prefix = p;
            }
        });
        return prefix;
    } else {
        return true;
    }
}
