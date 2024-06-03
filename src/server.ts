import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import bodyParser from "body-parser";

import dotenv from "dotenv-flow";
dotenv.config();
//dotenv.config({ path: ".env.development" });

const app = express();

//parse request of content-type json
app.use(bodyParser.json());

const server = createServer(app);

const io = new Server(server);

//connect to mongodb
mongoose
  .connect(process.env.DBHOST as string, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true
  })
  .catch((error) => console.log("Error connecting to mongoDB:" + error));

mongoose.connection.once("open", () =>
  console.log("Connected successfuly to MongoDB")
);

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
