import * as socketIO from "socket.io";
import { v4 as uuidv4 } from "uuid";

import chat from "../controllers/ChatController";
import { videoChat } from "../controllers/videoChatController";

import users from "../models/users";

class SocketIo {
    io;
    constructor(app) {
        this.io = socketIO(app);
    }

    socketMiddleware() {
        this.io.use(async (socket, next) => {
            // get user info from socket
            const { userID, username } = socket.handshake.query;

            const user = await users.findById(userID);
            // check if user exists on database
            if (user) {
                // set socket info to user info
                socket.userID = userID;
                socket.username = username;
                console.log("user found", socket.userID, socket.username);
                return next();
            } else {
                return next(new Error("invalid username"));
            }
        });
    }

    socketConnection() {
        this.io.on("connection", async (socket) => {
            console.log("user connected: ", socket.username, socket.userID);

            const user: any = await users
                .findById(socket.userID)
                .populate("contact");

            // join the userID to room
            socket.join(socket.userID);

            // get contact list
            chat.getContactList(socket, user);

            // ping selected user
            socket.on("chat with you", (payload) =>
                chat.handleChatPing(socket, payload)
            );
            
            // ping chat to all commercial
            socket.on("init chat to all", (payload) => {
                chat.handleChatPingForAllComercial(socket, payload)
            }
            );

            // forward the private message to the right recipient
            socket.on("private message", (payload) =>
                chat.handlePrivateMessage(socket, payload)
            );

            // notify users upon disconnecion
            socket.on("chat disconnect", (payload) =>
                chat.handleDisconnection(this.io, socket, payload)
            );

            /**VIDEO CHAT  */
            socket.on("call-user", (payload) =>
                videoChat.handleOnCallUser(socket, payload)
            );
            socket.on("make-answer", (payload) =>
                videoChat.handleMakeAnwser(socket, payload)
            );

            // hang up connection
            socket.on("hangup", (payload) =>
                videoChat.handleHangup(socket, payload)
            );

            // user is busy
            socket.on("busy", (payload) =>
                videoChat.handleBusy(socket, payload)
            )
        });
    }
}

export default SocketIo;
