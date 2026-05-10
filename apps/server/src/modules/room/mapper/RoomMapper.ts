import { RoomWithUnread } from "../room.service";
import { RoomDto } from "../dto/room.dto";

export class RoomMapper {
  static toDto(entity: RoomWithUnread): RoomDto {
    return {
      id: entity.id,
      participants: entity.participants.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
      })),
      unreadCount: entity.unreadCount,
      createdAt: entity.createdAt,
    };
  }

  static toDtoList(entities: RoomWithUnread[]): RoomDto[] {
    return entities.map(RoomMapper.toDto);
  }
}
