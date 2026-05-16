import { Test, TestingModule } from "@nestjs/testing";
import { UserLogSchedulerService } from "../user-log-scheduler.service";
import { DocumentService } from "../document.service";
import { UserService } from "../../user/user.service";
import { NotFoundException } from "@nestjs/common";
import * as fs from "fs";

jest.mock("fs");

describe("UserLogSchedulerService", () => {
  let service: UserLogSchedulerService;
  let documentService: jest.Mocked<DocumentService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockDocumentService = {
      generateExecutionLogDoc: jest.fn(),
    };

    const mockUserService = {
      findUsersWithLoggingEnabled: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLogSchedulerService,
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<UserLogSchedulerService>(UserLogSchedulerService);
    documentService = module.get(
      DocumentService
    ) as jest.Mocked<DocumentService>;
    userService = module.get(UserService) as jest.Mocked<UserService>;

    jest.clearAllMocks();
  });

  describe("getUserLogBuffer", () => {
    const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

    it("should throw NotFoundException if user has logging disabled", async () => {
      userService.findUsersWithLoggingEnabled.mockResolvedValue([]);

      await expect(service.getUserLogBuffer(mockUserId)).rejects.toThrow(
        new NotFoundException("Detailed logging is not enabled for this user.")
      );
    });

    it("should throw NotFoundException if active log file does not exist", async () => {
      userService.findUsersWithLoggingEnabled.mockResolvedValue([
        { id: mockUserId },
      ] as any);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.getUserLogBuffer(mockUserId)).rejects.toThrow(
        new NotFoundException("No active logs available to process.")
      );
    });

    it("should throw NotFoundException if no logs match the user ID", async () => {
      userService.findUsersWithLoggingEnabled.mockResolvedValue([
        { id: mockUserId },
      ] as any);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // File has logs, but none for our mockUserId
      (fs.readFileSync as jest.Mock).mockReturnValue(
        "[User: different-id | Role: ADMIN] [START] HTTP GET /api"
      );

      await expect(service.getUserLogBuffer(mockUserId)).rejects.toThrow(
        new NotFoundException("No execution logs found for your account.")
      );
    });

    it("should filter user logs and return a document buffer successfully", async () => {
      const targetLog = `[User: ${mockUserId} | Role: ADMIN] [START] HTTP GET /api`;
      const otherLog = `[User: different-id | Role: ADMIN] [START] HTTP GET /api`;
      const rawLogs = `${targetLog}\n${otherLog}`;
      const mockBuffer = Buffer.from("mock-doc");

      userService.findUsersWithLoggingEnabled.mockResolvedValue([
        { id: mockUserId },
      ] as any);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(rawLogs);
      documentService.generateExecutionLogDoc.mockResolvedValue(mockBuffer);

      const result = await service.getUserLogBuffer(mockUserId);

      // Verify it only passed the filtered logs to the document generator
      expect(documentService.generateExecutionLogDoc).toHaveBeenCalledWith([
        targetLog,
      ]);
      expect(result).toEqual(mockBuffer);
    });
  });
});
