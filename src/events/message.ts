/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
const xpCooldown = {};
const chatCooldown = {};
const cmdCooldown = {};
const msgCache = [];
import Plex from "../main/Plex";
import { Message, GuildChannel, TextChannel } from "discord.js";
import axios from "axios";
module.exports = class {
    client: Plex;
    data: any;
    constructor(client: Plex) {
        this.client = client;
        this.data = {
            guild: {},
            member: {},
            user: {},
        };
    }
    async run(message: Message) {
        if (message.author.bot) return;
        if (message.system) return;
        this.client.messages.inc();
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
        if (
            message.guild &&
            (this.data.guild.autoMod.msgSpam.delete ||
                this.data.guild.autoMod.msgSpam.warn ||
                this.data.guild.autoMod.msgSpam.autoMute)
        ) {
            chatCooldown[message.author.id + ":" + message.guild.id]++;
            if (isNaN(chatCooldown[message.author.id + ":" + message.guild.id]))
                chatCooldown[message.author.id + ":" + message.guild.id] = 1;
            setTimeout(function () {
                chatCooldown[message.author.id + ":" + message.guild.id]--;
            }, 3500);
            if (chatCooldown[message.author.id + ":" + message.guild.id] > 3) {
                this.data.guild.autoMod.msgSpam.delete ? await message.delete() : null;
                this.data.guild.autoMod.msgSpam.warn
                    ? this.client.emit("warnMember", message.member, "Autowarned for spamming")
                    : null;
                this.data.guild.autoMod.msgSpam.autoMute
                    ? this.client.emit("muteMember", {
                          member: message.member,
                          muter: message.guild.me,
                          time: this.data.guild.autoMod.autoMuteTime,
                          reason: `Automuted for ${this.data.guild.autoMod.autoMuteTime} due to spamming`,
                      })
                    : null;
                return;
            }
        }

        if (message.guild) {
            if (
                (this.data.guild.autoMod.blockedWordsEnabled.delete ||
                    this.data.guild.autoMod.blockedWordsEnabled.warn ||
                    this.data.guild.autoMod.blockedWordsEnabled.autoMute) &&
                message.content.length > 2
            ) {
                const lm = message.content.toLowerCase();
                const includedBadWord = this.data.guild.autoMod.blockedWords.some(
                    (element) => lm.indexOf(element) !== -1
                );
                if (includedBadWord) {
                    this.data.guild.autoMod.blockedWordsEnabled.delete
                        ? await message.delete()
                        : null;
                    this.data.guild.autoMod.blockedWordsEnabled.warn
                        ? this.client.emit(
                              "warnMember",
                              message.member,
                              "Autowarned for saying a blocked message"
                          )
                        : null;
                    this.data.guild.autoMod.blockedWordsEnabled.autoMute
                        ? this.client.emit("muteMember", {
                              member: message.member,
                              muter: message.guild.me,
                              time: this.data.guild.autoMod.autoMuteTime,
                              reason: `Automuted for ${this.data.guild.autoMod.autoMuteTime} due to saying a blocked word`,
                          })
                        : null;
                    return;
                }
            }
            if (
                this.data.guild.autoMod.allCaps.delete ||
                this.data.guild.autoMod.allCaps.warn ||
                this.data.guild.autoMod.allCaps.autoMute
            ) {
                if (
                    message.content === message.content.toUpperCase() &&
                    message.content.length > 3
                ) {
                    this.data.guild.autoMod.allCaps.delete ? await message.delete() : null;
                    this.data.guild.autoMod.allCaps.warn
                        ? this.client.emit(
                              "warnMember",
                              message.member,
                              "Autowarned for posing a message in all caps"
                          )
                        : null;
                    this.data.guild.autoMod.allCaps.autoMute
                        ? this.client.emit("muteMember", {
                              member: message.member,
                              muter: message.guild.me,
                              time: this.data.guild.autoMod.autoMuteTime,
                              reason: `AutoMuted for ${this.data.guild.autoMod.autoMuteTime} due to sending a message in all caps`,
                          })
                        : null;
                    return;
                }
            }
            if (
                this.data.guild.autoMod.invites.delete ||
                this.data.guild.autoMod.invites.warn ||
                this.data.guild.autoMod.invites.autoMute
            ) {
                const regx = /^((?:https?:)?\/\/)?((?:www|m)\.)? ((?:discord\.gg|discordapp\.com))/gi;
                const link = regx.test(message.content.toLowerCase().replace(/\s+/g, ""));
                if (link) {
                    this.data.guild.autoMod.invites.delete ? await message.delete() : null;
                    this.data.guild.autoMod.invites.warn
                        ? this.client.emit(
                              "warnMember",
                              message.member,
                              "Autowarned for posting a invite"
                          )
                        : null;
                    this.data.guild.autoMod.invites.autoMute
                        ? this.client.emit("muteMember", {
                              member: message.member,
                              muter: message.guild.me,
                              time: this.data.guild.autoMod.autoMuteTime,
                              reason: `AutoMuted for ${this.data.guild.autoMod.autoMuteTime} due to posting a link`,
                          })
                        : null;
                    return;
                }
            }
            if (
                this.data.guild.autoMod.links.delete ||
                this.data.guild.autoMod.links.warn ||
                this.data.guild.autoMod.links.autoMute
            ) {
                const regx = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
                const discordInv = regx.test(message.content.toLowerCase().replace(/\s+/g, ""));
                if (discordInv) {
                    this.data.guild.autoMod.links.delete ? await message.delete() : null;
                    this.data.guild.autoMod.links.warn
                        ? this.client.emit(
                              "warnMember",
                              message.member,
                              "Autowarned for posting a link"
                          )
                        : null;
                    this.data.guild.autoMod.links.autoMute
                        ? this.client.emit("muteMember", {
                              member: message.member,
                              muter: message.guild.me,
                              time: this.data.guild.autoMod.autoMuteTime,
                              reason: `AutoMuted for ${this.data.guild.autoMod.autoMuteTime} due to posting a link`,
                          })
                        : null;
                    return;
                }
            }
            if (
                this.data.guild.autoMod.emojiSpam.delete ||
                this.data.guild.autoMod.emojiSpam.warn ||
                this.data.guild.autoMod.emojiSpam.autoMute
            ) {
                const regx = /(:)([^\s]){1,22}(:)/gi;
                const emojiCount = (message.content.match(regx) || []).length;
                if (emojiCount > this.data.guild.autoMod.maxEmoji) {
                    this.data.guild.autoMod.emojiSpam.delete ? await message.delete() : null;
                    this.data.guild.autoMod.emojiSpam.warn
                        ? this.client.emit(
                              "warnMember",
                              message.member,
                              "Autowarned for emoji spam"
                          )
                        : null;
                    this.data.guild.autoMod.emojiSpam.autoMute
                        ? this.client.emit("muteMember", {
                              member: message.member,
                              muter: message.guild.me,
                              time: this.data.guild.autoMod.autoMuteTime,
                              reason: `AutoMuted for ${this.data.guild.autoMod.autoMuteTime} due to posting more emojis then the limit`,
                          })
                        : null;
                    return;
                }
            }
            if (
                this.data.guild.autoMod.massMentions.delete ||
                this.data.guild.autoMod.massMentions.warn ||
                this.data.guild.autoMod.massMentions.autoMute
            ) {
                const mentions =
                    message.mentions.members.size +
                    message.mentions.roles.size +
                    message.mentions.users.size;
                if (mentions > this.data.guild.autoMod.massMention) {
                    this.data.guild.autoMod.massMentions.delete ? await message.delete() : null;
                    this.data.guild.autoMod.massMentions.warn
                        ? this.client.emit(
                              "warnMember",
                              message.member,
                              "Autowarned for mass mentioning"
                          )
                        : null;
                    this.data.guild.autoMod.massMentions.autoMute
                        ? this.client.emit("muteMember", {
                              member: message.member,
                              muter: message.guild.me,
                              time: this.data.guild.autoMod.autoMuteTime,
                              reason: `AutoMuted for ${this.data.guild.autoMod.autoMuteTime} due to mass mentioning`,
                          })
                        : null;
                    return;
                }
            }
            if (
                this.data.guild.autoMod.spoilers.delete ||
                this.data.guild.autoMod.spoilers.warn ||
                this.data.guild.autoMod.spoilers.autoMute
            ) {
                const regx = /((\|\|)(.)+(\|\|))/gi;
                const spoiler = regx.test(message.content);
                if (spoiler) {
                    this.data.guild.autoMod.spoilers.delete ? await message.delete() : null;
                    this.data.guild.autoMod.spoilers.warn
                        ? this.client.emit(
                              "warnMember",
                              message.member,
                              "Autowarned for Sending spoilers"
                          )
                        : null;
                    this.data.guild.autoMod.spoilers.autoMute
                        ? this.client.emit("muteMember", {
                              member: message.member,
                              muter: message.guild.me,
                              time: this.data.guild.autoMod.autoMuteTime,
                              reason: `AutoMuted for ${this.data.guild.autoMod.autoMuteTime} due to posting a spoiler`,
                          })
                        : null;
                    return;
                }
            }
            if (
                this.data.guild.autoMod.repWords.delete ||
                this.data.guild.autoMod.repWords.warn ||
                this.data.guild.autoMod.repWords.autoMute
            ) {
                const newMsg = {
                    mID: message.id,
                    gID: message.guild.id,
                    aID: message.author.id,
                    content: message.content,
                    ts: message.createdTimestamp,
                };
                msgCache.push(newMsg);
                const cachedMessages = msgCache.filter(
                    (m) => m.aID === message.author.id && m.gID === message.guild.id
                );
                const duplicateMatches = cachedMessages.filter(
                    (m) => m.content === message.content && m.ts > newMsg.ts - 10000
                );
                if (duplicateMatches.length > 4) {
                    this.data.guild.autoMod.repWords.delete
                        ? duplicateMatches.forEach(async (m) => {
                              const msg = await message.channel.messages.fetch(m.mID);
                              await msg.delete();
                          })
                        : null;
                    this.data.guild.autoMod.repWords.warn
                        ? this.client.emit(
                              "warnMember",
                              message.member,
                              "Autowarned for sending duplicate text"
                          )
                        : null;
                    this.data.guild.autoMod.repWords.autoMute
                        ? this.client.emit("muteMember", {
                              member: message.member,
                              muter: message.guild.me,
                              time: this.data.guild.autoMod.autoMuteTime,
                              reason: `AutoMuted for ${this.data.guild.autoMod.autoMuteTime} due to sending duplicate text`,
                          })
                        : null;
                    return;
                }
            }
        }
        if (message.guild) {
            await updateXp(message, this.data);
        }
        const afkReason = this.data.user.afk;
        if (afkReason) {
            this.data.user.afk = null;
            await axios({
                url: `http://localhost:${process.env.PORT || 3000}/user`,
                method: "put",
                params: {
                    id: this.data.user.id,
                },
                data: this.data.user,
            });
            message.channel.send(`Afk turned off for ${message.author.tag}`);
        }
        message.mentions.users.forEach(async (u) => {
            const userData: any = await this.client.findOrCreateUser({ id: u.id });
            if (userData.afk) {
                message.reply(`<@${u.id}> is afk`);
            }
        });
        if (this.data.client.autoResponses[message.content]) {
            return message.channel.send(this.data.client.autoResponses[message.content].response);
        }
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
            let isBlockedRole = false;
            message.member.roles.cache.forEach((role) => {
                if (this.data.guild.commandData[cmd.help.name].blockedRoles.includes(role.id))
                    isBlockedRole = true;
            });
            if (isBlockedRole) return;
        }
        if (message.guild) {
            if (
                this.data.guild.commandData[cmd.help.name].blockedChannels.includes(
                    message.channel.id
                )
            )
                return;
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
        let uCooldown = cmdCooldown[message.author.id];
        if (!uCooldown) {
            cmdCooldown[message.author.id] = {};
            uCooldown = cmdCooldown[message.author.id];
        }
        const time = uCooldown[cmd.help.name] || 0;
        if (time && time > Date.now()) {
            return message.channel.send(
                `heyyyyy, enter the chilzone, and wait ${Math.ceil(
                    (time - Date.now()) / 1000
                )} to use that command again`
            );
        }
        cmdCooldown[message.author.id][cmd.help.name] =
            Date.now() + (cmd.conf.cooldown ? cmd.conf.cooldown : 3000);

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
            this.client.commandCount.inc();
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
        data.member.exp = newXp - neededXp;
    }

    // Update user data
    await axios({
        url: `http://localhost:${process.env.PORT || 3000}/member`,
        method: "put",
        params: {
            id: data.member.id,
            guildID: data.member.guildID,
        },
        data: data.member,
    });
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
