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
        ignoredRoles: { type: Array, default: [] },
        autoDeleteModCommands: { type: Boolean, default: false }, // Whether to auto delete moderation commands
        nickname: { type: String, default: "Plex" },
        autoResponses: { type: Array, default: {} },
        plugins: {
            type: Object,
            default: {
                autoRole: {
                    role: null,
                },
                warnLimits: {
                    kick: false,
                    ban: false,
                },
                reports: false,
                suggestions: false,
            },
        },
        autoMod: {
            type: Object,
            default: {
                blockedWordsEnabled: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                },
                blockedWords: [
                    "nigg",
                    "fuck",
                    "fuk",
                    "cunt",
                    "cnut",
                    "bitch",
                    "dick",
                    "d1ck",
                    "pussy",
                    "asshole",
                    "b1tch",
                    "b!tch",
                    "blowjob",
                    "cock",
                    "c0ck",
                ],
                allCaps: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                },
                msgSpam: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                },
                invites: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                },
                links: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                },
                massMentions: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                    ban: false,
                },
                emojiSpam: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                },
                spoilers: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                },
                repWords: {
                    delete: false,
                    warn: false,
                    autoMute: false,
                },
                autoMuteTime: 600000,
                maxEmoji: 4,
                massMention: 7,
                allowedRoles: [],
                ignoredChannels: [],
            },
        },
        logs: {
            type: Object,
            default: {
                specifyChanel: false,
                join: false,
                leave: false,
                nicknameUpdate: false,
                ban: false,
                unBan: false,
                kick: false,
                roleAdd: false,
                roleDelete: false,
                roleUpdate: false,
                roleGiven: false,
                roleRemoved: false,
                emojiAdd: false,
                emojiDelete: false,
                emojiUpdate: false,
                messageEdit: false,
                bulkMessageDelete: false,
                channelCreate: false,
                channelDelete: false,
                channelUpdate: false,
                modCommand: false,
                joinVc: false,
                leaveVc: false,
                moveVc: false,
                inviteCreate: false,
            },
        },
        caseCount: { type: Number, default: 0 },
    })
);
