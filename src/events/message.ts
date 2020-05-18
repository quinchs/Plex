/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
const xpCooldown = {};
module.exports = class {
    client: any;
    data: {
        guild: any;
        member: any;
        user: any;
    };

    constructor(client) {
        this.client = client;
        this.data = {
            guild: {},
            member: {},
            user: {},
        };
    }
    async run(message) {
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
                if (!message.channel.permissionsFor(message.member).has("MANAGE_MESSAGES")) {
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
            const userData = await this.client.findOrCreateUser({ id: u.id });
            if (userData.afk) {
                message.channel.send("That user is afk");
            }
        });
        this.client.logger.log("Zone 1", "debug");
        const prefix: any = await getPrefix(message, this.data, this.client);
        if (!prefix) return;
        this.client.logger.log("Zone 2", "debug");
        const args = message.content
            .slice(typeof prefix === "string" ? prefix.length : 0)
            .trim()
            .split(/ +/g);
        const command = args.shift().toLowerCase();
        const cmd =
            this.client.commands.get(command) ||
            this.client.commands.get(this.client.aliases.get(command));
        if (!cmd) return;
        this.client.logger.log("Zone 3", "debug");
        if (cmd.conf.guildOnly && !message.guild) {
            return message.channel.send("That command is only usable in guilds");
        }

        if (message.guild) {
            let neededPermission = [];
            if (!cmd.conf.botPermissions.includes("EMBED_LINKS")) {
                cmd.conf.botPermissions.push("EMBED_LINKS");
            }
            cmd.conf.botPermissions.forEach((perm) => {
                if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
                    //@ts-ignore
                    neededPermission.push(perm);
                }
            });
            if (neededPermission.length > 0) {
                return message.channel.send(
                    "I need the following permissions to perform this command:" +
                        neededPermission.map((p) => `\`${p}\``).join(", ")
                );
            }
            neededPermission = [];
            cmd.conf.memberPermissions.forEach((perm) => {
                if (!message.channel.permissionsFor(message.member).has(perm)) {
                    //@ts-ignore
                    neededPermission.push(perm);
                }
            });
            if (neededPermission.length > 0) {
                return message.channel.send(
                    "You need the following permissions to perform this command:" +
                        neededPermission.map((p) => `\`${p}\``).join(", ")
                );
            }
            if (
                this.data.guild.ignoredChannels.includes(message.channel.id) &&
                !message.member.hasPermission("MANAGE_MESSAGES")
            ) {
                return (
                    message.delete() &&
                    message.author.send("Commands are forbidden in " + message.channel)
                );
            }

            if (cmd.conf.permission) {
                if (!message.member.hasPermission(cmd.conf.permission)) {
                    return message.channel.send(
                        message.language.get("INHIBITOR_PERMISSIONS", cmd.conf.permission)
                    );
                }
            }

            if (
                !message.channel.permissionsFor(message.member).has("MENTION_EVERYONE") &&
                (message.content.includes("@everyone") || message.content.includes("@here"))
            ) {
                return message.channel.send(
                    "You are not allowed to mention everyone or here in the commands."
                );
            }
            if (!message.channel.nsfw && cmd.conf.nsfw) {
                return message.channel.send(
                    "You must go to in a channel that allows the NSFW to type this command!"
                );
            }
        }

        if (!cmd.conf.enabled) {
            return message.channel.send("This command is currently disabled!");
        }

        this.client.logger.log(
            `${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`,
            "cmd"
        );

        try {
            cmd.run(message, args, this.data);
            if (cmd.help.category === "Moderation" && this.data.guild.autoDeleteModCommands) {
                message.delete();
            }
        } catch (e) {
            console.error(e);
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
    // Gets the user informations
    const points = parseInt(data.member.exp);
    const level = parseInt(data.member.level);

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
    //@ts-ignore
    const newXp = parseInt(points + won, 10);

    // calculation how many xp it takes for the next new one
    const neededXp = 5 * (level * level) + 80 * level + 100;

    // check if the member up to the next level
    if (newXp > neededXp) {
        //@ts-ignore
        data.member.level = parseInt(level + 1, 10);
    }

    // Update user data
    //@ts-ignore
    data.member.exp = parseInt(newXp, 10);
    await data.member.save();
}

async function getPrefix(message, data, client) {
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
