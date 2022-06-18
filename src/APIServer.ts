import { EventEmitter, WebSocketClient, WebSocketServer } from "./deps.ts";
import { sendDanmaku } from './SendDanmaku.ts'
import config from "./config.ts";

interface Message {
  cmd: string;
  // deno-lint-ignore no-explicit-any
  data: any;
}

const server = new WebSocketServer(config.api.port);
const authedClientSet: Set<WebSocketClient> = new Set();

class APIMsgHandler extends EventEmitter {
  emit(
    eventName: string | symbol,
    socket: WebSocketClient,
    ...args: unknown[]
  ): boolean {
    if (eventName === "AUTH") {
      if (args[0] === config.api.token) {
        authedClientSet.add(socket);
        socket.send(JSON.stringify({ cmd: "AUTH", data: "AUTHED" }));
        return true;
      } else {
        socket.send(JSON.stringify({ cmd: "AUTH", data: "FAILED" }));
        return true;
      }
    }
    if (authedClientSet.has(socket)) {
      super.emit.apply(this, [eventName, socket, args]);
      return true;
    }
    return false;
  }
}

const serverEventEmitter = new APIMsgHandler();

serverEventEmitter.on("SEND", (_socket: WebSocketClient, data: string) => {
    sendDanmaku({
      msg: data,
    });
});

serverEventEmitter.on("ROOMID", (socket: WebSocket) => {
  socket.send(JSON.stringify({
    cmd: "ROOMID",
    data: config.room_id,
  }));
});

server.on("connection", (client: WebSocketClient) => {
  client.on("message", (data: string) => {
    const msg: Message = JSON.parse(data);
    serverEventEmitter.emit(msg.cmd, client, msg.data);
  });
});

export { server };
