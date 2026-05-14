import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RoomService } from "../room.service";
import { RoomEntity } from "../room.entity";
import { RoomReadCursorEntity } from "../room-read-cursor.entity";
import { ErrorCode } from "@clinio/shared";

const mockUnreadQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue([]),
};

const mockManager = {
  createQueryBuilder: jest.fn(() => mockUnreadQueryBuilder),
};

const mockRoomQueryBuilder = {
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
  getOne: jest.fn(),
};

const mockRoomRepo = {
  createQueryBuilder: jest.fn(() => mockRoomQueryBuilder),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockCursorRepo = {
  manager: mockManager,
  upsert: jest.fn(),
};

describe("RoomService", () => {
  let service: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        { provide: getRepositoryToken(RoomEntity), useValue: mockRoomRepo },
        {
          provide: getRepositoryToken(RoomReadCursorEntity),
          useValue: mockCursorRepo,
        },
      ],
    }).compile();

    service = module.get(RoomService);
    jest.clearAllMocks();
    mockRoomRepo.createQueryBuilder.mockReturnValue(mockRoomQueryBuilder);
    mockManager.createQueryBuilder.mockReturnValue(mockUnreadQueryBuilder);
    mockUnreadQueryBuilder.getRawMany.mockResolvedValue([]);
    Object.values(mockRoomQueryBuilder).forEach(
      (fn) => typeof fn === "function" && (fn as jest.Mock).mockReturnThis?.()
    );
    Object.values(mockUnreadQueryBuilder).forEach(
      (fn) => typeof fn === "function" && (fn as jest.Mock).mockReturnThis?.()
    );
    mockUnreadQueryBuilder.getRawMany.mockResolvedValue([]);
  });

  describe("findAllForUser", () => {
    it("returns empty array when user has no rooms", async () => {
      mockRoomQueryBuilder.getMany.mockResolvedValue([]);
      const result = await service.findAllForUser("u1");
      expect(result).toEqual([]);
    });

    it("returns rooms with unreadCount = 0 when no unread messages", async () => {
      const rooms = [{ id: "r1", participants: [], createdAt: new Date() }];
      mockRoomQueryBuilder.getMany.mockResolvedValue(rooms);
      mockUnreadQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.findAllForUser("u1");
      expect(result).toHaveLength(1);
      expect(result[0].unreadCount).toBe(0);
    });

    it("attaches unreadCount from query", async () => {
      const rooms = [
        { id: "r1", participants: [], createdAt: new Date() },
        { id: "r2", participants: [], createdAt: new Date() },
      ];
      mockRoomQueryBuilder.getMany.mockResolvedValue(rooms);
      mockUnreadQueryBuilder.getRawMany.mockResolvedValue([
        { roomId: "r1", unreadCount: 3 },
      ]);

      const result = await service.findAllForUser("u1");
      expect(result.find((r) => r.id === "r1")?.unreadCount).toBe(3);
      expect(result.find((r) => r.id === "r2")?.unreadCount).toBe(0);
    });
  });

  describe("findById", () => {
    it("throws ROOM_NOT_FOUND when room does not exist", async () => {
      mockRoomRepo.findOne.mockResolvedValue(null);
      await expect(service.findById("r1", "u1")).rejects.toMatchObject({
        response: { errorCode: ErrorCode.ROOM_NOT_FOUND },
      });
    });

    it("throws FORBIDDEN when user is not a participant", async () => {
      mockRoomRepo.findOne.mockResolvedValue({
        id: "r1",
        participants: [{ id: "u2" }],
      });
      await expect(service.findById("r1", "u1")).rejects.toMatchObject({
        response: { errorCode: ErrorCode.FORBIDDEN },
      });
    });

    it("returns room when user is participant", async () => {
      const room = { id: "r1", participants: [{ id: "u1" }] };
      mockRoomRepo.findOne.mockResolvedValue(room);
      const result = await service.findById("r1", "u1");
      expect(result).toEqual(room);
    });
  });

  describe("findOrCreate", () => {
    it("returns existing room if found", async () => {
      const room = { id: "r1", participants: [] };
      mockRoomQueryBuilder.getOne.mockResolvedValue(room);
      const result = await service.findOrCreate("u1", "u2");
      expect(result).toEqual(room);
      expect(mockRoomRepo.save).not.toHaveBeenCalled();
    });

    it("creates new room if not found", async () => {
      mockRoomQueryBuilder.getOne.mockResolvedValue(null);
      const newRoom = { id: "r2", participants: [] };
      mockRoomRepo.create.mockReturnValue({ participants: [] });
      mockRoomRepo.save.mockResolvedValue(newRoom);
      mockRoomRepo.findOneOrFail.mockResolvedValue(newRoom);
      const result = await service.findOrCreate("u1", "u2");
      expect(result).toEqual(newRoom);
    });
  });

  describe("markAsRead", () => {
    it("upserts cursor after verifying membership", async () => {
      const room = { id: "r1", participants: [{ id: "u1" }] };
      mockRoomRepo.findOne.mockResolvedValue(room);
      mockCursorRepo.upsert.mockResolvedValue(undefined);

      await service.markAsRead("r1", "u1");

      expect(mockCursorRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "u1", roomId: "r1" }),
        ["userId", "roomId"]
      );
    });

    it("throws FORBIDDEN when user is not a participant", async () => {
      mockRoomRepo.findOne.mockResolvedValue({
        id: "r1",
        participants: [{ id: "u2" }],
      });
      await expect(service.markAsRead("r1", "u1")).rejects.toMatchObject({
        response: { errorCode: ErrorCode.FORBIDDEN },
      });
      expect(mockCursorRepo.upsert).not.toHaveBeenCalled();
    });
  });
});
