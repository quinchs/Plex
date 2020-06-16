/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from "dotenv";
import mongoose from "mongoose";
import Plex from "./main/Plex";
import { readdir } from "fs";
import { join } from "path";
import express from "express";
import * as user from "./controllers/user";
import * as member from "./controllers/member";
import * as guild from "./controllers/guild";
import parser from "body-parser";
import axios from "axios";

dotenv.config();

const dev = process.env.dev ? true : false;

const client = new Plex(dev, { partials: ["MESSAGE", "CHANNEL", "REACTION"] });

export const app = express();

const start = async () => {
    axios.defaults.validateStatus = () => true;
    readdir(join(__dirname, "./commands"), (_, files: string[]) => {
        client.logger.log(`Loading a total of ${files.length} categories.`, "log");
        files.forEach(async (dir) => {
            readdir(join(__dirname, `./commands/${dir}`), (_, commands: string[]) => {
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
    readdir(join(__dirname, "./events"), (_, files: string[]) => {
        client.logger.log(`Loading a total of ${files.length} events.`, "log");
        files.forEach((file) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const eventName: any = file.split(".")[0];
            client.logger.log(`Loading Event: ${eventName}`);
            const event = new (require(join(__dirname, `./events/${file}`)))(client);
            client.on(eventName, (...args) => event.run(...args));
            delete require.cache[require.resolve(join(__dirname, `./events/${file}`))];
        });
    });

    client.login(process.env.token);

    mongoose
        .connect(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            client.logger.log("Connected to the Mongodb database.", "log");
            mongoose.set("useFindAndModify", false);
        })
        .catch((err) => {
            console.error(err);
        });
    app.set("port", process.env.PORT || "3000");
    app.listen(app.get("port"), () => {
        client.logger.log("REST Api ready");
    });
    app.get("/", parser.json(), () => console.log("test"));
    app.post("/user", user.createUser);
    app.get("/user", user.findUser);
    app.put("/user", parser.json(), user.updateUser);
    app.delete("/user", user.deleteUser);
    app.post("/member", member.createMember);
    app.get("/member", member.findMember);
    app.put("/member", parser.json(), member.updateMember);
    app.delete("/member", member.deleteMember);
    app.post("/guild", guild.createGuild);
    app.get("/guild", guild.findGuild);
    app.put("/guild", parser.json(), guild.updateGuild);
    app.delete("/guild", guild.deleteGuild);
};

start();
client
    .on("disconnect", () => client.logger.log("Bot is disconnecting...", "warn"))
    .on("error", (e: any) => client.logger.log(e, "error"))
    .on("warn", (info: string) => client.logger.log(info, "warn"))
    .on("debug", (db: string) => client.logger.log(db, "debug"));

process.on("unhandledRejection", (err: string) => {
    client.logger.log(err, "error");
});
