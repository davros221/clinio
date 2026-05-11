import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { messageKeys, roomKeys } from "@api";
import {
  useGetRoomsQuery,
  useGetMessagesQuery,
  getChatSocket,
  emitSendMessage,
  markRoomAsRead,
} from "@modules/chat";
import type { Message } from "@modules/chat";

export const useChatContent = () => {
  const { id: otherUserId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const { data: rooms } = useGetRoomsQuery();
  const room = rooms?.find((r) =>
    r.participants.some((p) => p.id === otherUserId)
  );

  const { data: messages, isLoading } = useGetMessagesQuery(room?.id);

  /**
   * Mark all room messages as read
   */
  useEffect(() => {
    if (!room?.id) return;
    markRoomAsRead(room.id)
      .then(() => queryClient.invalidateQueries({ queryKey: roomKeys.lists() }))
      .catch(console.error);
  }, [room?.id, queryClient]);

  useEffect(() => {
    if (!room?.id) return;

    const socket = getChatSocket();

    const handleMessage = (msg: Message) => {
      if (msg.roomId !== room.id) return;
      queryClient.setQueryData<Message[]>(
        messageKeys.list({ roomId: room.id }),
        (old) => [msg, ...(old ?? [])]
      );
      markRoomAsRead(room.id)
        .then(() =>
          queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
        )
        .catch(console.error);
    };

    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, [room?.id, queryClient]);

  const handleSend = () => {
    if (!text.trim() || !otherUserId) return;
    emitSendMessage(otherUserId, text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return {
    messages: messages ?? [],
    isLoading,
    hasRoom: !!room,
    text,
    setText,
    handleSend,
    handleKeyDown,
  };
};
