import { useQuery } from "@tanstack/react-query";
import { client } from "@clinio/api";
import { roomKeys } from "@api";

export interface RoomParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Room {
  id: string;
  participants: RoomParticipant[];
  unreadCount: number;
  createdAt: string;
}

const fetchRooms = async (): Promise<Room[]> => {
  const res = await client.get<Room[]>({ url: "/api/rooms" });
  return (res.data as unknown as Room[]) ?? [];
};

export const useGetRoomsQuery = () =>
  useQuery({
    queryKey: roomKeys.lists(),
    queryFn: fetchRooms,
  });

export const markRoomAsRead = (roomId: string): Promise<void> =>
  client.post({ url: `/api/rooms/${roomId}/read` }).then(() => undefined);
