/* eslint-disable @typescript-eslint/class-name-casing */
import { prop, Ref, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import config from "../config";
import { MemberClass } from "./Member";

class logs {
    @prop({ default: false })
    public location: string;

    @prop({ default: 1 })
    public level: number;
}

class autoRole {
    @prop({ default: false })
    public enabled: boolean;

    @prop({ default: null })
    public role: string;
}
@modelOptions({ options: { allowMixed: 0 } })
class autoMod {
    @prop({ default: false })
    public enabled: boolean;

    @prop({ default: [] })
    public ignored: [];

    @prop({ default: 1 })
    public level: number;
}

class warnLimits {
    @prop({ default: false })
    public kick: number;

    @prop({ default: false })
    public ban: number;
}
class plugins {
    @prop({ default: logs })
    public logs: logs;

    @prop({ default: autoRole })
    public autoRole: autoRole;

    @prop({ default: autoMod })
    public autoMod: autoMod;

    @prop({ default: warnLimits })
    public warnLimits: warnLimits;

    @prop({ default: false })
    public reports: string;

    @prop({ default: false })
    public suggestions: false;
}
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class GuildClass {
    @prop()
    public id: string; // The id of the guild

    @prop({ default: {} })
    public membersData: {}; //Member data of the guild

    @prop({ ref: MemberClass })
    public members: Ref<MemberClass>;

    @prop({ default: config.prefix })
    public prefix: string; //Default or custom prefix of the guild

    @prop({ default: [] })
    public ignoredChannels: []; // Channels ignored by the bot

    @prop({ default: [] })
    public commands: []; // Commands logs

    @prop()
    public plugins: plugins; //Guilds Plugins

    @prop({ default: false })
    public autoDeleteModCommands: boolean; // Whether to auto delete moderation commands

    @prop({ default: 0 })
    public caseCount: number;
}

export default getModelForClass(GuildClass);
