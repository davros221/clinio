import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessageEntity } from "./message.entity";
import { RoomService } from "../room/room.service";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
    private roomService: RoomService
  ) {}

  async create(
    roomId: string,
    senderId: string,
    text: string
  ): Promise<MessageEntity> {
    // verifies room exists and sender is a participant
    await this.roomService.findById(roomId, senderId);

    const message = this.messageRepository.create({ roomId, senderId, text });
    return this.messageRepository.save(message);
  }

  async findByRoom(
    roomId: string,
    userId: string,
    page = 1,
    limit = 50
  ): Promise<{ items: MessageEntity[]; total: number }> {
    await this.roomService.findById(roomId, userId);

    const [items, total] = await this.messageRepository.findAndCount({
      where: { roomId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }
}
