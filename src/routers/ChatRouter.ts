import { Router } from "express";
import ChatController from "../controllers/ChatController";

class ChatRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.get("", ChatController.getAllChat);
    }
}

export default new ChatRouter().router;
