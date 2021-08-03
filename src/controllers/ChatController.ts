import { Response, Request } from "express";
import * as path from "path";
import chats from "../models/chats";
import users from "../models/users";
import * as moment from "moment";
import 'moment/locale/fr'

// Chat Automation
const automatiqueReply = {
    resinence: `Bonjour, nous sommes actuellement indisponibles, nous vous remercions de bien vouloir nous adresser un message par mail.\nNous vous répondrons dans les meilleurs délais.\nN'hésitez pas à consulter www.resinence.com et profitez de la promo spéciales salon de -20% pour tout 1ère commande sur www.la-boutique-resinence.fr (code RENOVATION)\nA très bientôt.`,
    panasonic: `Bonjour, merci de vous êtres arrêté sur notre stand, notre représentant n'est pas disponible actuellement, nous vous invitons à vous rendre sur notre site internet qui regroupe un grand nombre d'informations, de regarder notre catalogue résindentiel disponible ainsi que nos vidéos et si vous avez des questions, n'hésitez pas à nous envoyer un mail à l'adresse chauffageclim-pfs@eu.panasonic.com.\nBonne journée !`
}
class ChatController {
    constructor() {
        moment.locale("fr")
    }

    getAllChat(req: Request, res: Response): void {
        chats
            .find()
            .then((data) => {
                res.status(200).json({
                    success: true,
                    data,
                });
            })
            .catch((err) => console.log(err));
    }

    Ping(req: Request, res: Response): void {
        res.sendStatus(200);
    }

    async handlePrivateMessage(socket: any, payload: any) {
        console.log("new message from :", socket.userID, ",to: ", payload.to);
        console.log("payload", payload);
        const message = {
            content: payload.content,
            from: socket.userID,
            files: payload.files,
            urlMatches: payload.urlMatches,
            upperDate: payload.upperDate,
            createdAt: payload.createdAt,
            to: payload.to,
            // index for unread message array from front
            indexInLocal: payload.indexInLocal,
        };
        console.log("emiting socket to sender");
        socket.emit("private message", message);
        console.log("emiting socket to recepient");
        console.log("message", message);
        socket.to(payload.to).emit("private message", message);
        await chats.create(message);

        // Checkout user for automation
        users.findById(payload.to).then(async (res: any) => {
            if (res && res.role === "commercial" && !res.connected) {
                const autoReply = {
                    content: "",
                    from: payload.to,
                    files: null,
                    urlMatches: null,
                    upperDate: moment(Date.now()).format('Do MMMM, HH:mm'),
                    createdAt: payload.createdAt,
                    to: socket.userID
                };
                switch (res.companyName) {
                    case 'Résinence':
                        autoReply.content = automatiqueReply.resinence;
                        socket.emit("private message", autoReply);
                        break;
                    case 'Panasonic Solutions Chauffage & Refroidissement':
                        autoReply.content = automatiqueReply.panasonic;
                        socket.emit("private message", autoReply);
                }
                await chats.create(autoReply);
            }
        });
    }

    async handleDisconnection(io: any, socket: any, payload: any) {
        console.log("disconnecting user....");
        const matchingSockets = await io.of("/").sockets;
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            // notify other users
            socket.broadcast.emit("user disconnecting", socket.userID);
        }
    }

    async handleChatPing(socket: any, payload: any) {
        // get user info
        const to = payload;
        const user: any = await users.findById(to);
        let username;

        // set username
        if (!user.firstName && !user.lastName && user.email) {
            username = user.email;
        }
        if (user.firstName || user.lastName) {
            username = `${user.lastName ? user.lastName : ""} ${
                user.firstName ? user.firstName : ""
            }`.trim();
        }

        // get all messages on users
        const messages = await chats.find({
            $or: [
                {
                    $and: [{ from: socket.userID }, { to }],
                },
                {
                    $and: [{ from: to }, { to: socket.userID }],
                },
            ],
        });
        const messagesPerUser = new Map();
        messages.forEach((message: any) => {
            const { from, to } = message;
            const otherUser = socket.userID === from ? to : from;
            const fromSelf = socket.userID === from;
            // copy message value to insert fromSefl data
            let newMessage = { ...message._doc };
            newMessage.fromSelf = fromSelf;

            if (messagesPerUser.has(otherUser)) {
                messagesPerUser.get(otherUser).push(newMessage);
            } else {
                messagesPerUser.set(otherUser, [newMessage]);
            }
        });
        console.log("want to chat to", to);

        // set each other information
        const myInfo = {
            userID: socket.userID,
            username: socket.username,
            connected: true,
            messages: messagesPerUser.get(socket.userID) || [],
        };

        const yourInfo = {
            userID: to,
            username,
            connected: user.connected,
            messages: messagesPerUser.get(to) || [],
        };

        // add user to contact
        //const commercial = await users.findById(to)
        const addToContactList = { $addToSet: { contact: socket.userID } };
        await users.findByIdAndUpdate(to, addToContactList, {
            runValidators: false,
        });

        socket.to(to).to(socket.userId).emit("chat with you", myInfo);

        // send selected user info to user
        socket.emit("user info", yourInfo);
    }

    // trigged when user clicked on stand
    async handleChatPingForAllComercial(socket: any, payload: any) {
        // get user info
        const to = payload;
        const user: any = await users.findById(to);
        // get all messages on users
        const messages = await chats.find({
            $or: [
                {
                    from: socket.userID
                },
                {
                    to: socket.userID
                },
            ],
        });
        const messagesPerUser = new Map();
        messages.forEach((message: any) => {
            const { from, to } = message;
            const otherUser = socket.userID === from ? to : from;
            const fromSelf = socket.userID === from;
            // copy message value to insert fromSefl data
            let newMessage = { ...message._doc };
            newMessage.fromSelf = fromSelf;

            if (messagesPerUser.has(otherUser)) {
                messagesPerUser.get(otherUser).push(newMessage);
            } else {
                messagesPerUser.set(otherUser, [newMessage]);
            }
        });
        console.log("want to chat to", to);

        // add user to contact
        //const commercial = await users.findById(to)
        const addToContactList = { $addToSet: { contact: socket.userID } };
        await users.updateMany({role: 'commercial'}, addToContactList, {
            runValidators: false,
        });
    }

    async getContactList(socket: any, user: any) {
        // list all connected users
        const userList = [];

        //get user messages on database
        const messageList = await chats.find({
            $or: [{ from: socket.userID }, { to: socket.userID }],
        });

        const messagesPerUser = new Map();
        messageList.forEach((message: any) => {
            const { from, to } = message;
            const otherUser = socket.userID === from ? to : from;
            const fromSelf = socket.userID === from;
            // copy message value to insert fromSefl data
            let newMessage = { ...message._doc };
            newMessage.fromSelf = fromSelf;
            if (messagesPerUser.has(otherUser)) {
                messagesPerUser.get(otherUser).push(newMessage);
            } else {
                messagesPerUser.set(otherUser, [newMessage]);
            }
        });

        // get user contact
        user.contact.forEach((user) => {
            //console.log("contact", user)
            let username: string;
            if (!user.firstName && !user.lastName && user.email) {
                username = user.email;
            }
            if (user.firstName || user.lastName) {
                username = `${user.lastName ? user.lastName : ""} ${
                    user.firstName ? user.firstName : ""
                }`.trim();
            }

            console.log("show contact per user", user._id);
            userList.push({
                userID: user._id,
                username,
                connected: user.connected,
                messages: messagesPerUser.get(user._id.toString()) || [],
            });
        });
        console.log("users", userList);
        socket.emit("users", userList);
    }
}

const chat = new ChatController();

export default chat;
