/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Collection } from "discord.js";
import Config from "../config";
import logger from "./logger";
import guild from "./Guild";
import member from "./Member";
import user from "./User";
import path from "path";
import log from "./DBLog"
//CLient class:
class Main extends Client {
    config: any;
    commands: Collection<any, any>;
    aliases: Collection<any, any>;
    guildData: import("mongoose").Model<import("mongoose").Document, {}>;
    memberData: import("mongoose").Model<import("mongoose").Document, {}>;
    dbCache: {
        member: Collection<any, any>;
        user: Collection<any, any>;
        guild: Collection<any, any>;
    };
    userData: import("mongoose").Model<import("mongoose").Document, {}>;
    logger: typeof logger;
    dev: boolean;
    logs: any;

    constructor(options, dev: boolean) {
        super(options);
        this.logs = log;
        this.config = Config;
        this.commands = new Collection();
        this.aliases = new Collection();
        this.logger = logger;
        this.guildData = guild;
        this.memberData = member;
        this.userData = user;
        this.dev = dev;

        this.dbCache = {
            member: new Collection(),
            user: new Collection(),
            guild: new Collection(),
        };
    }
    // This function is used to load a command and add it to the collection
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    loadCommand(commandPath: any, commandName: any) {
        try {
            const props = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
            this.logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
            props.conf.location = commandPath;
            if (props.init) {
                props.init(this);
            }
            this.commands.set(props.help.name.toLowerCase(), props);
            props.conf.aliases.forEach((alias) => {
                this.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }

    // This function is used to unload a command (you need to load them again)
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async unloadCommand(commandPath: any, commandName: any) {
        let command;
        if (this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        } else if (this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
        }
        if (!command) {
            return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
        }
        if (command.shutdown) {
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
        return false;
    }
    async findOrCreateUser({ id: id }) {
        return new Promise(async (res) => {
            if (this.dbCache.user.get(id)) {
                res(this.dbCache.user.get(id));
            } else {
                let data = await this.userData.findOne({ id: id });
                if (data) {
                    res(data);
                } else {
                    data = new this.userData({ id: id });
                    await data.save();
                    res(data);
                }
                this.dbCache.user.set(id, data);
            }
        });
    } // This function is used to find a member data or create it
    async findOrCreateMember({ id: id, guildID }) {
        return new Promise(async (resolve) => {
            if (this.dbCache.member.get(`${id}${guildID}`)) {
                resolve(this.dbCache.member.get(`${id}${guildID}`));
            } else {
                let data = await this.memberData.findOne({ id: id, guildID });
                if (data) {
                    resolve(data);
                } else {
                    data = new this.memberData({ id: id, guildID: guildID });
                    await data.save();
                    const guild: any = await this.findOrCreateGuild({ id: guildID });
                    if (guild) {
                        guild.members.push(data._id);
                        await guild.save();
                    }
                    resolve(data);
                }
                this.dbCache.member.set(`${id}${guildID}`, data);
            }
        });
    }

    // This function is used to find a guild data or create it
    async findOrCreateGuild({ id: guildID }) {
        return new Promise(async (resolve) => {
            if (this.dbCache.guild.get(guildID)) {
                resolve(this.dbCache.guild.get(guildID));
            } else {
                let data = await this.guildData.findOne({ id: guildID }).populate("members");
                if (data) {
                    resolve(data);
                } else {
                    data = new this.guildData({ id: guildID });
                    await data.save();
                    resolve(data);
                }
                this.dbCache.guild.set(guildID, data);
            }
        });
    }
}
export default Main;
