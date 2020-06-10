import mongoose from "mongoose";

export const log = mongoose.model(
    "Log",
    new mongoose.Schema({
        commandName: { type: String, default: "unknown" },
        date: { type: Number, default: Date.now() },
        author: {
            type: Object,
            default: {
                username: "Unknown",
                discrminator: "0000",
                id: null,
            },
        },
        guild: {
            type: Object,
            default: {
                name: "Unknown",
                id: null,
            },
        },
    })
);
