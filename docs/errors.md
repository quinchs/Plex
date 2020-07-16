# Errors

Plex has many custom errors, some being handled automatically in the message event. Here are the errors.

#### Command Error
- Command error is the base for all errors. When all other errors don't fit, throw this.
- Takes a discord message, and other error arguments
- Example: `throw Client.Errors.CommandError(message)`

#### Arg Error
- Arg Error is when a problem has happened because of an argument
- Takes a Discord Message, the arg position, the required arg, and any other error arguments
- Example: `throw Client.Errors.ArgError(message, 1, "random argument")`

#### Missing Arg
- Missing Arg is to be thrown when an arg is missing
- Takes a Discord Message, the arg position, the required arg, and any other error arguments
- Example: `throw Client.Errors.MissingArg(message, 1, "random argument")`

#### Missing Mention
- When a mention is expected, but nothing is received
- Takes a Discord Message, the arg position, the required arg, and any other error arguments
- Example: `throw Client.Errors.MissingMention(message, 1, "random argument")`

#### Invalid Arg
- When an argument is received, but is invalid
- Takes a Discord Message, the arg position, the required arg, and any other error arguments
- Example: `throw Client.Errors.InvalidArg(message, 1, "random argument")`

#### Invalid Mention
- When an argument is received, and it's expected to me a mention, but its invalid
- Takes a Discord Message, the arg position, the required arg, and any other error arguments
- Example: `throw Client.Errors.InvalidMention(message, 1, "random argument")`

#### Permission Error
- When a required permission is not given
- Takes a Discord message, the required permission, and other error arguments
- Example `throw Client.Errors.PermissionError(message, "MANAGE_ROLES")`

#### Bot Permission Error
- When the bot does not have a required permission
- Takes a Discord message, the required permission, and other error arguments
- Example `throw Client.Errors.BotPermissionError(message, "MANAGE_ROLES")`

#### User Permission Error
- When the user does not have a required permission
- Takes a Discord message, the required permission, and other error arguments
- Example `throw Client.Errors.UserPermissionError(message, "MANAGE_ROLES")`