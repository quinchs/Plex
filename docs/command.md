# Command Format

Create a new file in your category, named \<command name>.ts

> Please create a new file in a category that fits in the command description, or if no category fits, please use the Other category. If it does not fit the category, the pull request to master will be declined.
 
In the file, use this default format to describe the command

```typescript
import Command from "../../main/Command";
import { Message } from "discord.js";
import Plex from "../../main/Plex";
/**
 * @extends Command
 */
module.exports = class extends Command {
    client: Plex;
    constructor(client: Plex) {
        super(client, {
            name: "",
            dirname: __dirname,
            enabled: true,
            guildOnly: false,
            description: "",
            usage: "",
            examples: "",
            aliases: [""],
            botPermissions: [""],
            memberPermissions: [""],
            nsfw: false,
            cooldown: 3000,
        });
    }
    async run(message: Message, args: [string], data) {
    /* Command here */
};
```
| Param | Description | Type |
| ----------- | ----------- | ----------- | 
| name | Name of the command. Same as the file name with out the .ts| string |
| dirname | Keep this __dirname or it breaks the command | string |
| enabled | If the command is enabled. Please keep it true | boolean |
| description | Description of the command | string |
| usage | Usage of the command | string |
| examples | A example of the command | string |
| aliases | A array of aliases strings. These act as another command name | Array of strings |
| botPermissions | Permissions the bot needs to run the command. | Array of strings. Strings must be a djs permission flag |
| memberPermissions | Permissions the user needs to run the command. Make sure they have to be able to dow what the command is doing with out the bot | Array of strings. Strings must be a djs permission flag |
| nswf | If the command is nsfw. If it's ran in a non-nswf channel, it will decline | boolean | 
| cooldown | Cooldown to use the command | number |

In the run function, it sends 3 peices of data. message, the message that ran the command. args, the arguments of the command. data, data of the user, guild, and member. For more info about data read [data management](data-management.md)

> When making commands, please make sure to follow these guidelines
- Minilmistc as possible
- When problems happen, like a missing arg, use our custom [errors](errors.md). Send the message, react to the message with :x: then delete the error message after 5 seconds
- If you have any questions, fell free to contact an administrators
- When taking moderation actions, use the clients custom events.
