import { prop, getModelForClass } from "@typegoose/typegoose";
// eslint-disable-next-line @typescript-eslint/class-name-casing
class cooldowns {
    @prop({ default: 0 })
    public work: number;

    @prop({ default: 0 })
    public rob: number;
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class mute {
    @prop({ default: false })
    public muted: boolean;

    @prop({ default: null })
    public case: string;

    @prop({ default: false })
    endDate: string;
}
export class MemberClass {
    /* Info */
    @prop()
    public id?: string; // ID of the Member

    @prop()
    public guildID?: string; // ID of the guild to which the member is connected

    /* ECON */
    @prop({ default: 0 })
    public exp?: number; // Exp points of the user

    @prop({ default: 0 })
    public level?: number; // Level of the user

    @prop({ default: 0 })
    public money?: number; // How much money they have

    @prop()
    public cooldowns?: cooldowns; // Cooldowns for items

    @prop({ default: 0 })
    public workStreak?: number; // work streak of the user

    @prop({ default: 0 }) // Bank sold of the user
    public bankSold?: number;

    /* STATS */
    @prop({ default: Date.now() })
    public registeredAt?: number; // Registered date of the member

    /* OTHER INFORMATION */
    @prop({ default: [] })
    public sanctions?: []; // Array of the member sanctions (mute, ban, kick, etc...)

    @prop()
    public mute: mute;
}
export const Member = getModelForClass(MemberClass);
