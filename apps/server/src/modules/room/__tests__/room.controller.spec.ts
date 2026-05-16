import { Test, TestingModule } from "@nestjs/testing";
import { RoomController } from "../room.controller";
import { RoomService } from "../room.service";
import { UserRole } from "@clinio/shared";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";
import { ErrorCode } from "@clinio/shared";

const mockRoomService = {
  findAllForUser: jest.fn(),
  markAsRead: jest.fn(),
};

const currentUser: AuthUser = {
  id: "u1",
  email: "u1@test.com",
  role: UserRole.DOCTOR,
};

describe("RoomController", () => {
  let controller: RoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [{ provide: RoomService, useValue: mockRoomService }],
    }).compile();

    controller = module.get(RoomController);
    jest.clearAllMocks();
  });

  describe("getRooms", () => {
    it("returns mapped rooms with unreadCount for current user", async () => {
      mockRoomService.findAllForUser.mockResolvedValue([
        {
          id: "r1",
          participants: [
            {
              id: "u1",
              firstName: "John",
              lastName: "Doe",
              email: "u1@test.com",
            },
          ],
          unreadCount: 2,
          createdAt: new Date(),
        },
      ]);
      const result = await controller.getRooms(currentUser);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("r1");
      expect(result[0].unreadCount).toBe(2);
      expect(mockRoomService.findAllForUser).toHaveBeenCalledWith("u1");
    });
  });

  describe("markRoomAsRead", () => {
    it("delegates to service and returns nothing", async () => {
      mockRoomService.markAsRead.mockResolvedValue(undefined);
      await controller.markRoomAsRead("r1", currentUser);
      expect(mockRoomService.markAsRead).toHaveBeenCalledWith("r1", "u1");
    });

    it("propagates errors from service", async () => {
      mockRoomService.markAsRead.mockRejectedValue({
        response: { errorCode: ErrorCode.FORBIDDEN },
      });
      await expect(
        controller.markRoomAsRead("r1", currentUser)
      ).rejects.toMatchObject({
        response: { errorCode: ErrorCode.FORBIDDEN },
      });
    });
  });
});
