/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Collection, ClientOptions, Guild } from "discord.js";
import Config from "../config";
import logger from "./logger";
import { guild } from "./Guild";
import Member from "./Member";
import user from "./User";
import path from "path";
import { log } from "./DBLog";
import util from "util";
import axios from "axios";
/**
 * This is the bots main client that extends discords client.
 * @extends {Client}
 */
class Plex extends Client {
    config: any;
    commands: Collection<any, any>;
    aliases: Collection<any, any>;
    guildData: import("mongoose").Model<import("mongoose").Document, {}>;
    dbCache: {
        member: Collection<any, any>;
        user: Collection<any, any>;
        guild: Collection<any, any>;
    };
    userData: import("mongoose").Model<import("mongoose").Document, {}>;
    logger: logger;
    dev: boolean;
    logs: any;
    memberData: any;
    wait: { (ms: number): Promise<void>; <T>(ms: number, value: T): Promise<T> };
    /**
     * @param {ClientOptions} [ClientOptions]
     * @param {boolean} Dev
     */
    constructor(dev: boolean, options?: ClientOptions) {
        super(options);
        this.logs = log;
        this.config = Config;
        this.commands = new Collection();
        this.aliases = new Collection();
        this.logger = new logger();
        this.guildData = guild;
        this.memberData = Member;
        this.userData = user;
        this.dev = dev;
        this.wait = util.promisify(setTimeout);

        this.dbCache = {
            member: new Collection(),
            user: new Collection(),
            guild: new Collection(),
        };
    }
    async clearCache() {
        this.dbCache.member.clear;
        this.dbCache.user.clear;
        this.dbCache.guild.clear;
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
            props.conf.aliases.forEach((alias: string) => {
                this.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }

    async findOrCreateUser({ id: id }) {
        return new Promise(async (res) => {
            if (this.dbCache.user.get(id)) {
                return res(this.dbCache.user.get(id));
            } else {
                const data = await axios({
                    method: "get",
                    url: `http://localhost:${process.env.PORT || 3000}/user`,
                    params: {
                        id: id,
                    },
                });
                if (data.status === 200) {
                    this.dbCache.user.set(id, data);
                    return res(data.data);
                } else {
                    const newData = await axios({
                        method: "post",
                        url: `http://localhost:${process.env.PORT || 3000}/user`,
                        params: {
                            id: id,
                        },
                    });
                    if (newData.status !== 200) return res(null);
                    this.dbCache.user.set(id, newData.data);
                    return res(newData.data);
                }
            }
        });
    } // This function is used to find a member data or create it
    async findOrCreateMember({ id: id, guildID }) {
        return new Promise(async (res) => {
            if (this.dbCache.member.get(`${id}${guildID}`)) {
                return res(this.dbCache.member.get(`${id}${guildID}`));
            } else {
                const data = await axios({
                    method: "get",
                    url: `http://localhost:${process.env.PORT || 3000}/member`,
                    params: {
                        id: id,
                        guildID: guildID,
                    },
                });
                if (data.status === 200) {
                    this.dbCache.member.set(`${id}${guildID}`, data);
                    return res(data.data);
                } else {
                    const newData = await axios({
                        method: "post",
                        url: `http://localhost:${process.env.PORT || 3000}/user`,
                        params: {
                            id: id,
                        },
                    });
                    if (newData.status !== 200) return res(null);
                    const guild: any = await this.findOrCreateGuild({ id: guildID });
                    this.dbCache.member.set(`${id}${guildID}`, newData.data);
                    return res(newData.data);
                }
            }
        });
    }

    // This function is used to find a guild data or create it
    async findOrCreateGuild({ id: guildID }) {
        return new Promise(async (res) => {
            if (this.dbCache.guild.get(guildID)) {
                return res(this.dbCache.guild.get(guildID));
            } else {
                const data = await axios({
                    method: "get",
                    url: `http://localhost:${process.env.PORT || 3000}/guild`,
                    params: {
                        id: guildID,
                    },
                });
                if (data.status === 200) {
                    this.dbCache.guild.set(guildID, data.data);
                    return res(data.data);
                } else {
                    const newData = await axios({
                        method: "post",
                        url: `http://localhost:${process.env.PORT || 3000}/guild`,
                        params: {
                            id: guildID,
                        },
                    });
                    if (newData.status !== 200) return res(null);
                    this.dbCache.user.set(guildID, newData.data);
                    return res(newData.data);
                }
            }
        });
    }
    async resolveUser(search: string) {
        let user = null;
        if (!search || typeof search !== "string") return;
        // Try ID search
        if (search.match(/^<@!?(\d+)>$/)) {
            const id = search.match(/^<@!?(\d+)>$/)[1];
            user = this.users.cache.get(id);
            if (user) return user;
        }
        // Try username search
        if (search.match(/^!?(\w+)#(\d+)$/)) {
            const username = search.match(/^!?(\w+)#(\d+)$/)[0];
            const discriminator = search.match(/^!?(\w+)#(\d+)$/)[1];
            user = this.users.cache.find(
                (u) => u.username === username && u.discriminator === discriminator
            );
            if (user) return user;
        }
        user = this.users.cache.get(search);
        return user;
    }

    async resolveMember(search: string, guild: Guild) {
        let member = null;
        if (!search || typeof search !== "string") return;
        // Try ID search
        if (search.match(/^<@!?(\d+)>$/)) {
            const id = search.match(/^<@!?(\d+)>$/)[1];
            member = await guild.members.fetch(id).catch((e) => {
                this.logger.log(e, "error");
            });
            if (member) return member;
        }
        // Try username search
        if (search.match(/^!?(\w+)#(\d+)$/)) {
            guild = await guild.fetch();
            member = guild.members.cache.find((m) => m.user.tag === search);
            if (member) return member;
        }
        member = await guild.members.fetch(search).catch((e) => {
            this.logger.log(e, "error");
        });
        return member;
    }

    async resolveRole(search: string, guild: Guild) {
        let role = null;
        if (!search || typeof search !== "string") return;
        // Try ID search
        if (search.match(/^<@&!?(\d+)>$/)) {
            const id = search.match(/^<@&!?(\d+)>$/)[1];
            role = guild.roles.cache.get(id);
            if (role) return role;
        }
        // Try name search
        role = guild.roles.cache.find((r) => search === r.name);
        if (role) return role;
        role = guild.roles.cache.get(search);
        return role;
    }
}
export default Plex;
