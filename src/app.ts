import * as http from "http";
import server from "./server";
import config from "./environments";
import * as socketIO from "socket.io";
const PORT = config.APP_PORT;
const app = http.createServer(server.app);
const io = socketIO(app);

server.routes();
import SocketIo from "./events/socket";

const socket = new SocketIo(app);

socket.socketMiddleware();
socket.socketConnection();

app.listen(PORT, () => {
    console.log("Express server listening on port " + PORT);
});
