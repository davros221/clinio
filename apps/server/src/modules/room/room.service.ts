import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RoomEntity } from "./room.entity";
import { RoomReadCursorEntity } from "./room-read-cursor.entity";
import { forbidden, roomNotFound } from "../../common/error-messages";

export type RoomWithUnread = RoomEntity & { unreadCount: number };

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>,
    @InjectRepository(RoomReadCursorEntity)
    private cursorRepository: Repository<RoomReadCursorEntity>
  ) {}

  async findAllForUser(userId: string): Promise<RoomWithUnread[]> {
    const rooms = await this.roomRepository
      .createQueryBuilder("room")
      .innerJoin("room.participants", "participant")
      .where("participant.id = :userId", { userId })
      .leftJoinAndSelect("room.participants", "allParticipants")
      .orderBy("room.createdAt", "DESC")
      .getMany();

    if (rooms.length === 0) return [];

    const roomIds = rooms.map((r) => r.id);

    const unreadRows = await this.cursorRepository.manager
      .createQueryBuilder()
      .select('msg."roomId"', "roomId")
      .addSelect("COUNT(msg.id)::int", "unreadCount")
      .from("messages", "msg")
      .leftJoin(
        "room_read_cursors",
        "cursor",
        'cursor."roomId" = msg."roomId" AND cursor."userId" = :userId',
        { userId }
      )
      .where('msg."roomId" IN (:...roomIds)', { roomIds })
      .andWhere(
        'msg."createdAt" > COALESCE(cursor."lastReadAt", \'epoch\'::timestamptz)'
      )
      .groupBy('msg."roomId"')
      .getRawMany<{ roomId: string; unreadCount: number }>();

    const unreadMap = new Map(unreadRows.map((r) => [r.roomId, r.unreadCount]));

    return rooms.map((room) =>
      Object.assign(room, { unreadCount: unreadMap.get(room.id) ?? 0 })
    );
  }

  async findById(roomId: string, userId: string): Promise<RoomEntity> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["participants"],
    });

    if (!room) throw roomNotFound();

    const isMember = room.participants.some((p) => p.id === userId);
    if (!isMember) throw forbidden();

    return room;
  }

  async findOrCreate(userIdA: string, userIdB: string): Promise<RoomEntity> {
    const existing = await this.roomRepository
      .createQueryBuilder("room")
      .innerJoin("room.participants", "a", "a.id = :userIdA", { userIdA })
      .innerJoin("room.participants", "b", "b.id = :userIdB", { userIdB })
      .leftJoinAndSelect("room.participants", "allParticipants")
      .getOne();

    if (existing) return existing;

    const room = this.roomRepository.create();
    room.participants = [{ id: userIdA } as any, { id: userIdB } as any];
    const saved = await this.roomRepository.save(room);
    return this.roomRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ["participants"],
    });
  }

  async markAsRead(roomId: string, userId: string): Promise<void> {
    await this.findById(roomId, userId);
    await this.cursorRepository.upsert(
      { userId, roomId, lastReadAt: new Date() },
      ["userId", "roomId"]
    );
  }
}
