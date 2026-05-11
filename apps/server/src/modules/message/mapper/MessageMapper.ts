import { MessageEntity } from "../message.entity";
import { MessageDto } from "../dto/message.dto";

export class MessageMapper {
  static toDto(entity: MessageEntity): MessageDto {
    return {
      id: entity.id,
      roomId: entity.roomId,
      senderId: entity.senderId,
      text: entity.text,
      createdAt: entity.createdAt,
    };
  }

  static toDtoList(entities: MessageEntity[]): MessageDto[] {
    return entities.map(MessageMapper.toDto);
  }
}
