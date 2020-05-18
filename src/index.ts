/* eslint-disable @typescript-eslint/ban-ts-ignore */
import Discord from "discord.js";
import dotenv from "dotenv";
import mongnpoDB from "mongodb";
import mongoose from "mongoose";
import Main from "./main/main";
import { readdir } from "fs";
dotenv.config();
const dev = process.env.dev ? true : false;
const client = new Main({ partials: ["MESSAGE", "CHANNEL", "REACTION"] }, dev);
const start = async () => {
    readdir("./src/commands/", (err, files: string[]) => {
        client.logger.log(`Loading a total of ${files.length} categories.`, "log");
        files.forEach(async (dir) => {
            console.log(dir);
            readdir("./src/commands/" + dir + "/", (error, commands: string[]) => {
                commands
                    .filter((cmd) => cmd.split(".").pop() === (dev ? "ts" : "js"))
                    .forEach((cmd) => {
                        const response = client.loadCommand("./commands/" + dir, cmd);
                        if (response) {
                            client.logger.log(response, "error");
                        }
                    });
            });
        });
    });
    // Then we load events, which will include our message and ready event.
    readdir("./src/events/", (err, files: string[]) => {
        client.logger.log(`Loading a total of ${files.length} events.`, "log");
        files.forEach((file) => {
            const eventName: any = file.split(".")[0];
            console.log(file);
            client.logger.log(`Loading Event: ${eventName}`);
            const event = new (require(`../src/events/${file}`))(client);
            client.on(eventName, (...args) => event.run(...args));
            delete require.cache[require.resolve(`../src/events/${file}`)];
        });
    });

    client.login(process.env.token);

    mongoose
        //@ts-ignore
        .connect(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            client.logger.log("Connected to the Mongodb database.", "log");
        })
        .catch((err) => {
            console.error(err);
        });
};

start();
client
    .on("disconnect", () => client.logger.log("Bot is disconnecting...", "warn"))
    .on("error", (e) => client.logger.log(e, "error"))
    .on("warn", (info) => client.logger.log(info, "warn"));

process.on("unhandledRejection", (err) => {
    console.error(err);
});
