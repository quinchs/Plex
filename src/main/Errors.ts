/**
 * Command error is the base for all errors. When all other errors don't fit throw this
 * @extends Error
 * @param [DiscordMessage] The message that it errored on
 */
export class CommandError extends Error {
    private discordMessage: any;
    constructor(DiscordMessage, ...args: any) {
        super(...args);
        this.name = this.constructor.name;
        this.discordMessage = DiscordMessage;
        this.message = "A command error occurred";
        CommandError.captureStackTrace(this, CommandError);
    }
}

/**
 * Arg Error is when a problem has happened because of an argument
 * @extends CommandError
 * @param [DiscordMessage] The message that it errored on
 * @param [argPosition] The arg position
 * @param [requiredArg] The required arg
 */
export class ArgsError extends CommandError {
    private araPosition: any;
    private requiredArg: any;
    constructor(DiscordMessage, argPosition, requiredArg, ...args: any) {
        super(DiscordMessage, ...args);
        this.araPosition = argPosition;
        this.requiredArg = requiredArg;
        this.message = "A argument error occurred";
        ArgsError.captureStackTrace(this, ArgsError);
    }
}
/**
 * Missing Arg is to be thrown when an arg is missing
 * @extends ArgsError
 * @param [DiscordMessage] The message that it errored on
 * @param [argPosition] The arg position
 * @param [requiredArg] The required arg
 */
export class MissingArg extends ArgsError {
    constructor(DiscordMessage, argPosition, requiredArg, ...args) {
        super(DiscordMessage, argPosition, requiredArg, ...args);
        MissingArg.captureStackTrace(this, MissingArg);
        this.message = "A argument was missing in the command";
    }
}
/**
 * When a mention is expected, but nothing is received
 * @extends MissingArg
 * @param [DiscordMessage] The message that it errored on
 * @param [argPosition] The arg position
 * @param [requiredArg] The required arg
 */
export class MissingMention extends MissingArg {
    constructor(DiscordMessage, argPosition, requiredArg, ...args) {
        super(DiscordMessage, argPosition, requiredArg, ...args);
        MissingMention.captureStackTrace(this, MissingMention);
        this.message = "A mention/id/tag was expected, but the arg was empty";
    }
}
/**
 * When a argument is received, but is invalid
 * @extends ArgsError
 * @param [DiscordMessage] The message that it errored on
 * @param [argPosition] The arg position
 * @param [requiredArg] The required arg
 */
export class InvalidArg extends ArgsError {
    constructor(DiscordMessage, argPoss, requiredArg, ...args) {
        super(DiscordMessage, argPoss, requiredArg, ...args);
        InvalidArg.captureStackTrace(this, InvalidArg);
        this.message = "A argument provided was invalid data";
    }
}
/**
 * When a argument is received, and its expected to me a mention, but its invalid
 * @extends InvalidArg
 * @param [DiscordMessage] The message that it errored on
 * @param [argPosition] The arg position
 * @param [requiredArg] The required arg
 */
export class InvalidMention extends InvalidArg {
    constructor(DiscordMessage, argPoss, requiredArg, ...args) {
        super(DiscordMessage, argPoss, requiredArg, ...args);
        InvalidMention.captureStackTrace(this, InvalidMention);
        this.message =
            "A mention/id/tag was expected, but something else was received or it was invalid";
    }
}

/**
 * When a required permission is not given
 * @extends CommandError
 * @param [DiscordMessage] The message that it errored on
 * @param [MissingPermission] The missing permissions
 */
export class PermissionError extends CommandError {
    private missingPermission: any;
    constructor(DiscordMessage, MissingPermission, ...args) {
        super(DiscordMessage, ...args);
        PermissionError.captureStackTrace(this, PermissionError);
        this.message = "I was not able to complete the command due to a permission error";
        this.missingPermission = MissingPermission;
    }
}
/**
 * When the bot does not have a required permission
 * @extends PermissionError
 * @param [DiscordMessage] The message that it errored on
 * @param [MissingPermission] The missing permissions
 */
export class BotPermissionError extends PermissionError {
    constructor(DiscordMessage, MissingPermission, ...args) {
        super(DiscordMessage, MissingPermission, ...args);
        BotPermissionError.captureStackTrace(this, BotPermissionError);
        this.message =
            "I was not able to complete a command due to me not having enough permissions";
    }
}
/**
 * When a user does not have required permissions
 * @extends PermissionError
 * @param [DiscordMessage] The message that it errored on
 * @param [MissingPermission] The missing permissions
 */
export class UserPermissionError extends PermissionError {
    constructor(DiscordMessage, MissingPermission, ...args) {
        super(DiscordMessage, MissingPermission, ...args);
        BotPermissionError.captureStackTrace(this, UserPermissionError);
        this.message =
            "I was not able to complete a command due to the user not having enough permissions";
    }
}
