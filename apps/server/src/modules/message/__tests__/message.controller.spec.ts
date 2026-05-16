import { Test, TestingModule } from "@nestjs/testing";
import { MessageController } from "../message.controller";
import { MessageService } from "../message.service";
import { UserRole } from "@clinio/shared";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";

const mockMessageService = { findByRoom: jest.fn() };

const currentUser: AuthUser = {
  id: "u1",
  email: "u1@test.com",
  role: UserRole.DOCTOR,
};

describe("MessageController", () => {
  let controller: MessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [{ provide: MessageService, useValue: mockMessageService }],
    }).compile();

    controller = module.get(MessageController);
    jest.clearAllMocks();
  });

  it("returns paginated messages for room", async () => {
    mockMessageService.findByRoom.mockResolvedValue({
      items: [
        {
          id: "m1",
          roomId: "r1",
          senderId: "u1",
          text: "hi",
          createdAt: new Date(),
        },
      ],
      total: 1,
    });

    const result = await controller.getMessages("r1", currentUser);
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockMessageService.findByRoom).toHaveBeenCalledWith(
      "r1",
      "u1",
      1,
      50
    );
  });
});
