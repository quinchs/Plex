import { Request, Response } from "express";
import User from "../main/User";
import Logger from "../main/logger";
const logger = new Logger();
export const createUser = async (req: Request, res: Response) => {
    logger.log(`POST Request made at ${req.originalUrl}`, "rest");
    if (!req.query.id) return res.status(400).send("Invalid User ID");
    const user = await User.findOne({ id: req.query.id });
    if (user) return res.status(200).send(user);
    User.create({ id: req.query.id })
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch((e) => {
            return res.status(500).send(e);
        });
};
// create user will create a simple user with just the id and defaults
// POST Method

export const findUser = async (req: Request, res: Response) => {
    logger.log(`GET Request made at ${req.originalUrl}`, "rest");
    if (!req.query.id) return res.status(400).send("Invalid User ID");
    const user = await User.findOne({ id: req.query.id });
    if (user) return res.status(200).send(user);
    return res.status(404).send("No data found from the requested User ID");
};
//GET Method

export const deleteUser = async (req: Request, res: Response) => {
    logger.log(`DELETE Request made at ${req.originalUrl}`, "rest");
    if (!req.query.id) return res.status(400).send("Invalid User ID");
    const userCheck = await User.findOne({ id: req.query.id });
    if (!userCheck) return res.status(200).send("No data found from the requested User ID");
    await User.deleteOne({ id: req.query.id }, (e) => {
        if (!e) {
            return res.status(200).send("Successfully Deleted the User");
        } else return res.status(500).send(e);
    });
};
//DELETE Method

export const updateUser = async (req: Request, res: Response) => {
    logger.log(`PUT Request made at ${req.originalUrl}`, "rest");
    if (!req.query.id) return res.status(400).send("Invalid User ID");
    const userCheck = await User.findOne({ id: req.query.id });
    if (!userCheck) res.status(404).send("No data found from the requested User ID");
    const data = await User.findOneAndUpdate({ id: req.query.id }, req.body, { new: true });
    await data.save();
    if (!data) res.status(500).send("Internal Server Error");
    return res.status(200).send(data);
};
// PUT Method
