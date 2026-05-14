import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MessageService } from "../message.service";
import { MessageEntity } from "../message.entity";
import { RoomService } from "../../room/room.service";
import { ErrorCode } from "@clinio/shared";

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
};

const mockRoomService = {
  findById: jest.fn(),
};

describe("MessageService", () => {
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: getRepositoryToken(MessageEntity), useValue: mockRepo },
        { provide: RoomService, useValue: mockRoomService },
      ],
    }).compile();

    service = module.get(MessageService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("throws when sender is not room participant", async () => {
      mockRoomService.findById.mockRejectedValue({
        response: { errorCode: ErrorCode.FORBIDDEN },
      });
      await expect(service.create("r1", "u1", "hello")).rejects.toMatchObject({
        response: { errorCode: ErrorCode.FORBIDDEN },
      });
    });

    it("creates and returns message", async () => {
      mockRoomService.findById.mockResolvedValue({ id: "r1" });
      const msg = { id: "m1", roomId: "r1", senderId: "u1", text: "hello" };
      mockRepo.create.mockReturnValue(msg);
      mockRepo.save.mockResolvedValue(msg);
      const result = await service.create("r1", "u1", "hello");
      expect(result).toEqual(msg);
    });
  });

  describe("findByRoom", () => {
    it("returns paginated messages", async () => {
      mockRoomService.findById.mockResolvedValue({ id: "r1" });
      mockRepo.findAndCount.mockResolvedValue([[{ id: "m1" }], 1]);
      const result = await service.findByRoom("r1", "u1");
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
