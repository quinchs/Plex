/* eslint-disable @typescript-eslint/class-name-casing */
import { prop, getModelForClass } from "@typegoose/typegoose";
class author {
    @prop({ default: "Unknown" })
    public username: string;

    @prop({ default: "0000" })
    public discriminator: string;

    @prop({ default: null })
    public id: string;
}

class guild {
    @prop({ default: "Unknown" })
    public name: string;

    @prop({ default: null })
    public id: string;
}
class DBLogClass {
    @prop({ default: "Unknown" })
    commandName: string;

    @prop({ default: Date.now() })
    public date: number;

    @prop({ default: author })
    public author: author;

    @prop({ default: guild })
    public guild: guild;
}
const DBLog = getModelForClass(DBLogClass);
export default DBLog;
