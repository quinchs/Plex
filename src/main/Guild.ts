import mongoose from "mongoose";
const Schema = mongoose.Schema;
import config from "../config";

export const guild = mongoose.model(
    "Guild",
    new Schema({
        id: { type: String }, // Discord ID of the
        membersData: { type: Object, default: {} }, // Members data of the
        members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
        prefix: { type: String, default: config.prefix }, // Default or custom prefix of the
        ignoredChannels: { type: Array, default: [] }, // Channels ignored by the bot
        commands: { type: Array, default: [] }, // Commands logs
        autoDeleteModCommands: { type: Boolean, default: false }, // Whether to auto delete moderation commands // Disabled categories
        plugins: {
            type: Object,
            default: {
                modlogs: false,
                logs: {
                    location: false,
                    level: 1,
                },
                autoRole: {
                    enabled: false,
                    role: null,
                },
                autoMod: {
                    enabled: false,
                    ignored: [],
                    level: 1,
                },
                warnLimits: {
                    kick: false,
                    ban: false,
                },
                reports: false,
                suggestions: false,
            },
        },
        caseCount: { type: Number, default: 0 },
    })
);
