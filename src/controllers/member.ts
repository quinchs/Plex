import { Request, Response } from "express";
import Member from "../main/Member";
import Logger from "../main/logger";
const logger = new Logger();
export const createMember = async (req: Request, res: Response) => {
    logger.log(`POST Request made at ${req.originalUrl}`, "rest");
    if (!req.query.id || !req.query.guildID)
        return res.status(400).send("Invalid Member ID, or Guild ID");
    const user = await Member.findOne({ guildID: req.query.guildID, id: req.query.id });
    if (user) return res.status(200).send(user);
    Member.create({ guildID: req.query.guildID, id: req.query.id })
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch((e) => {
            return res.status(500).send(e);
        });
};
// create user will create a simple user with just the id and defaults
// POST Method

export const findMember = async (req: Request, res: Response) => {
    logger.log(`GET Request made at ${req.originalUrl}`, "rest");
    if (!req.query.id || !req.query.guildID)
        return res.status(400).send("Invalid Member ID, or Guild ID");
    const user = await Member.findOne({ guildID: req.query.guildID, id: req.query.id });
    if (user) return res.status(200).send(user);
    return res.status(404).send("No data found from the requested User ID");
};
//GET Method

export const deleteMember = async (req: Request, res: Response) => {
    logger.log(`DELETE Request made at ${req.originalUrl}`, "rest");
    if (!req.query.id || !req.query.guildID)
        return res.status(400).send("Invalid Member ID, or Guild ID");
    const userCheck = await Member.findOne({
        id: req.query.id,
        guildID: req.query.guildID as string,
    });
    if (!userCheck) return res.status(200).send("No data found from the requested User ID");
    await Member.deleteOne({ id: req.query.id, guildID: req.query.guildID }, (e) => {
        if (!e) {
            return res.status(200).send("Successfully Deleted the User");
        } else return res.status(500).send(e);
    });
};
//DELETE Method

export const updateMember = async (req: Request, res: Response) => {
    logger.log(`PUT Request made at ${req.originalUrl}`, "rest");
    if (!req.query.id || !req.query.guildID) return res.status(400).send("Invalid User ID");
    const userCheck = await Member.findOne({
        id: req.query.id,
        guildID: req.query.guildID as string,
    });
    if (!userCheck) res.status(404).send("No data found from the requested User ID");
    const data = await Member.findOneAndUpdate(
        { id: req.query.id, guildID: req.query.guildID as string },
        req.body,
        { new: true }
    );
    await data.save();
    if (!data) res.status(500).send("Internal Server Error");
    return res.status(200).send(data);
};
// PUT Method
