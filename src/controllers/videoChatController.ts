import { Response, Request } from "express";
import { Socket } from "node:dgram";

class VideoChatController {
    constructor() {}

    Ping(req: Request, res: Response): void {
        res.sendStatus(200);
    }

    handleOnCallUser = (socket, payload) => {
        //console.log("do dall ...call payload ...", payload)
        const { offer, to, name, isFirstStep } = payload;
        socket.join(to);
        console.log("calling => ", to);
        socket.to(to).emit("call-made", {
            offer,
            socket: socket.userID,
            name,
            isFirstStep
        });
    };

    handleMakeAnwser = (socket, payload) => {
        console.log("answer made for =>", payload.to);
        const { answer, to } = payload;
        socket.to(to).emit("answer-made", {
            answer,
            socket: socket.userID,
        });
    };

    handleHangup = (socket, payload) => {
        console.log("to", payload.to)
        const to = payload.to;
        socket.to(to).emit("hangup-made", {
            socket: socket.userID
        }) 
    }

    handleBusy = (socket, payload) => {
        const to = payload.to;
        socket.to(to).emit("busy-made", {
            socket: socket.userID
        })
    }
}

const videoChat = new VideoChatController();

export { videoChat };
