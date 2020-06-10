import { prop, getModelForClass } from "@typegoose/typegoose";

export class UserClass {
    /* REQUIRED */
    @prop()
    public id: string; // Discord ID of the user

    /* ECONOMY (GLOBAL) */
    @prop({ default: 0 })
    public rep: number; // Reputation points of the user

    @prop()
    public birthdate: number; // Birthdate of the user (the timestamp)
    /* STATS */

    @prop({ default: Date.now })
    public registeredAt: number; // Registered date of the user

    /* OTHER INFORMATION */
    @prop({ default: null })
    public afk: string; // Whether the member is AFK
}
const User = getModelForClass(UserClass);
export default User;
