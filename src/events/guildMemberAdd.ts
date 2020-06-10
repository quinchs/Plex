import Plex from "../main/Plex"
module.exports = class {
    client: Plex;

    constructor(client) {
        this.client = client;
    }
    async run(member) {
        const guild = await member.guild.fetch();

        await this.client.findOrCreateGuild({ id: guild.id });

        const memberData = await this.client.findOrCreateMember({
            id: member.id,
            guildID: guild.id,
        });
        if (memberData.mute.muted && memberData.mute.endDate > Date.now()) {
            guild.channels.forEach((channel) => {
                channel
                    .updateOverwrite(member.id, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        CONNECT: false,
                    })
                    .catch((err) => {});
            });
        }
    }
};
