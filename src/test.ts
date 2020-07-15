import mongoose from "mongoose";
import Plex from "./main/Plex";
import { readdir } from "fs";
import { join } from "path";
import express from "express";

const dev = false
export const app = express();
const client = new Plex(false, { partials: ["MESSAGE", "CHANNEL", "REACTION"] });
app.listen(app.get("port"), (error) => {
    if(error) throw error
    client.logger.log("REST Api ready");
});
readdir(join(__dirname, "./commands"), (e, files: string[]) => {
    if(e) throw e
    files.forEach(async (dir) => {
        readdir(join(__dirname, `./commands/${dir}`), (e, commands: string[]) => {
            if(e) throw e
            commands
                .filter((cmd) => cmd.split(".").pop() === (dev ? "ts" : "js"))
                .forEach((cmd) => {
                    const response = client.loadCommand("./commands/" + dir, cmd);
                    if (response) {
                        throw response
                    }
                });
        });
    })});
readdir(join(__dirname, "./events"), (e, files: string[]) => {
    if(e) throw e
    files.forEach((file) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const eventName: any = file.split(".")[0];
            const event = new (require(join(__dirname, `./events/${file}`)))(client);
            client.on(eventName, (...args) => event.run(...args).catch(e => {throw e}));
            delete require.cache[require.resolve(join(__dirname, `./events/${file}`))];
        });
})

mongoose
    .connect(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        mongoose.set("useFindAndModify", false);
    })
    .catch((err) => {
        throw err
    });
client.login(process.env.token)

process.exit(0)