import { io, Socket } from "socket.io-client";
import { AuthToken } from "@utils";

interface JoinPayload {
  otherUserId: string;
}

interface SendMessagePayload {
  toUserId: string;
  text: string;
}

interface JoinedResponse {
  roomId: string;
}

interface ServerToClientEvents {
  message: (msg: import("./messageService").Message) => void;
  roomInvite: (room: import("./roomService").Room) => void;
}

interface ClientToServerEvents {
  auth: () => void;
  join: (
    payload: JoinPayload,
    callback: (res: { data: JoinedResponse }) => void
  ) => void;
  message: (payload: SendMessagePayload) => void;
}

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ChatSocket | null = null;

export const getChatSocket = (): ChatSocket => {
  if (!socket) {
    socket = io(`${import.meta.env.VITE_API_URL}/ws`, {
      autoConnect: false,
      auth: (cb) => cb({ token: AuthToken.get() }),
    });
  }
  return socket;
};

export const connectChatSocket = (): ChatSocket => {
  const s = getChatSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectChatSocket = (): void => {
  socket?.disconnect();
};

export const emitJoin = (otherUserId: string): Promise<JoinedResponse> => {
  return new Promise((resolve, reject) => {
    const s = getChatSocket();
    s.emit("join", { otherUserId }, (res) => {
      if ("data" in res) resolve(res.data);
      else reject(new Error("join failed"));
    });
  });
};

export const emitSendMessage = (toUserId: string, text: string): void => {
  getChatSocket().emit("message", { toUserId, text });
};
