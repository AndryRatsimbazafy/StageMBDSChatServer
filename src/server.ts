import * as express from "express";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as path from "path";

import config from "./environments";

import ChatRouter from "./routers/ChatRouter";
import PingRouter from "./routers/PingRouter";
import UploadRouter from "./routers/UploadRouter";

// Server class
class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    public config() {
        // set up mongoose
        console.log("Connecting to DB....");
        mongoose
            .connect(config.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
            })
            .then(() => console.log("Dabatase connected."))
            .catch((e) => console.log("Error connection db.", e));
        mongoose.set("useFindAndModify", false);
        mongoose.pluralize(null);

        // config
        this.app.use(bodyParser.json({ limit: "8000mb" }));
        this.app.use(
            bodyParser.urlencoded({ limit: "8000mb", extended: true })
        );
        this.app.use(cors());
        // this.app.use(express.static(path.join(__dirname, 'angular-fo')))
        this.app.use(
            "/public",
            express.static(path.join(process.cwd(), "public"))
        );
        this.app.use(express.static(path.join(process.cwd(), "angular-bo")));
    }

    public routes(): void {
        this.app.use("/api/chats", ChatRouter);
        this.app.use("/api/upload", UploadRouter);
        this.app.use("/ping", PingRouter);
    }
}

export default new Server();
