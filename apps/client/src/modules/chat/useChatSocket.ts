import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { matchPath } from "react-router";
import { client } from "@clinio/api";
import { roomKeys } from "@api";
import { ROUTER_PATHS } from "@router";
import {
  connectChatSocket,
  disconnectChatSocket,
  emitJoin,
} from "./chatSocket";
import type { Room } from "./roomService";
import type { Message } from "./messageService";

const joinAllRooms = async (currentUserId: string) => {
  const res = await client.get<Room[]>({ url: "/api/rooms" });
  const rooms: Room[] = (res.data as unknown as Room[]) ?? [];

  for (const room of rooms) {
    const other = room.participants.find((p) => p.id !== currentUserId);
    if (other) emitJoin(other.id);
  }
};

export const useChatSocket = (currentUserId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    const socket = connectChatSocket();

    const handleConnect = () => {
      socket.emit("auth");
      joinAllRooms(currentUserId).catch(console.error);
    };

    const handleRoomInvite = (room: Room) => {
      queryClient.setQueryData<Room[]>(roomKeys.lists(), (old) => {
        if (old?.some((r) => r.id === room.id)) return old;
        return [...(old ?? []), room];
      });
    };

    const handleMessage = (msg: Message) => {
      const cached = queryClient.getQueryData<Room[]>(roomKeys.lists());
      const roomKnown = cached?.some((r) => r.id === msg.roomId);
      if (!roomKnown) {
        void queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
        return;
      }

      if (msg.senderId === currentUserId) return;

      const match = matchPath(
        ROUTER_PATHS.CHAT_DETAIL,
        window.location.pathname
      );
      const isViewingThisChat = match?.params.id === msg.senderId;
      if (isViewingThisChat) return;

      queryClient.setQueryData<Room[]>(roomKeys.lists(), (old) =>
        old?.map((r) =>
          r.id === msg.roomId ? { ...r, unreadCount: r.unreadCount + 1 } : r
        )
      );
    };

    socket.on("connect", handleConnect);
    socket.on("roomInvite", handleRoomInvite);
    socket.on("message", handleMessage);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("roomInvite", handleRoomInvite);
      socket.off("message", handleMessage);
      disconnectChatSocket();
    };
  }, [currentUserId, queryClient]);
};
