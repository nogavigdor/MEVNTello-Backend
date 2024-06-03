"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
dotenv_flow_1.default.config();
//dotenv.config({ path: ".env.development" });
const app = (0, express_1.default)();
//parse request of content-type json
app.use(body_parser_1.default.json());
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
//connect to mongodb
mongoose_1.default
    .connect(process.env.DBHOST, {
//useNewUrlParser: true,
//useUnifiedTopology: true
})
    .catch((error) => console.log("Error connecting to mongoDB:" + error));
mongoose_1.default.connection.once("open", () => console.log("Connected successfuly to MongoDB"));
app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});
io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});
server.listen(5000, () => {
    console.log("listening on *:5000");
});
