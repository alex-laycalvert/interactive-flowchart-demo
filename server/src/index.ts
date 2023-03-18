import express from "express";
import cors from "cors";
import fs from "fs";
import bodyParser from "body-parser";
import { Node, Edge } from "reactflow";
import { makeData } from "./lib";

const app = express();

app.use(
    cors({
        origin: "*",
    })
);
app.use(bodyParser.json());

app.get("/", async (req, res) => {
    res.status(200).json("Hello, World!");
});

app.route("/data")
    .get(async (_, res) => {
        try {
            let data: { nodes: Node[]; edges: Edge[] } = {
                nodes: [],
                edges: [],
            };
            if (!fs.existsSync("data.json")) {
                console.info("CREATING DATA...");
                data = makeData();
                const dataStr = JSON.stringify(data);
                fs.writeFileSync("data.json", dataStr);
            } else {
                const dataStr = fs.readFileSync("data.json").toString();
                data = JSON.parse(dataStr);
            }
            res.status(200).json(data);
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    })
    .post(async (req, res) => {
        try {
            const data = req.body;
            const dataStr = JSON.stringify(data);
            fs.writeFileSync("data.json", dataStr);
            res.status(200).json("Data saved successfully");
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });

app.listen(5000, () => {
    console.info("Server is listening on port 5000");
});
