import mongoose from "mongoose";
const a = mongoose.model(
    "Member",
    new mongoose.Schema({
        /* REQUIRED */
        id: { type: String }, // Discord ID of the user
        guildID: { type: String }, // ID of the guild to which the member is connected

        /* SERVER ECONOMY */
        exp: { type: Number, default: 0 }, // Exp points of the user
        level: { type: Number, default: 0 }, // Level of the user

        /* STATS */
        registeredAt: { type: Number, default: Date.now() }, // Registered date of the member

        /* OTHER INFORMATIONS */
        sanctions: { type: Array, default: [] }, // Array of the member sanctions (mute, ban, kick, etc...)
        mute: {
            type: Object,
            default: {
                // The member mute infos
                muted: false,
                case: null,
                endDate: null,
            },
        },
    })
);
export default a;
