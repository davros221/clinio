import { useQuery } from "@tanstack/react-query";
import { client } from "@clinio/api";
import { messageKeys } from "@api";

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

const fetchMessages = async (roomId: string): Promise<Message[]> => {
  const res = await client.get({ url: `/api/rooms/${roomId}/messages` });
  return (res.data as { items?: Message[] })?.items ?? [];
};

export const useGetMessagesQuery = (roomId: string | undefined) =>
  useQuery({
    queryKey: messageKeys.list({ roomId }),
    queryFn: () => fetchMessages(roomId!),
    enabled: !!roomId,
  });
