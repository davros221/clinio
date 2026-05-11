import { Test, TestingModule } from "@nestjs/testing";
import { UserLogSchedulerService } from "../user-log-scheduler.service";
import { DocumentService } from "../document.service";
import { UserService } from "../../user/user.service";
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

  describe("processUserLogs", () => {
    it("should abort if active log does not exist", async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await service.processUserLogs();

      expect(fs.readFileSync).not.toHaveBeenCalled();
    });

    it("should read, truncate, and process logs for enabled users", async () => {
      const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
      const rawLogText = `[User: ${mockUserId} | Role: ADMIN] [START] HTTP GET /api\n[Anonymous] [START] GET /api/health`;
      const mockBuffer = Buffer.from("mock-doc");

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(rawLogText);

      // Mock user service to return the user from the regex match
      userService.findUsersWithLoggingEnabled.mockResolvedValue([
        { id: mockUserId, email: "test@example.com" } as any,
      ]);
      documentService.generateExecutionLogDoc.mockResolvedValue(mockBuffer);

      await service.processUserLogs();

      // 1. Ensure file was read and truncated immediately
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining("backend-execution.log"),
        "utf-8"
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("backend-execution.log"),
        ""
      );

      // 2. Ensure DB was queried with the parsed User ID
      expect(userService.findUsersWithLoggingEnabled).toHaveBeenCalledWith([
        mockUserId,
      ]);

      // 3. Ensure document was generated only for the user's logs
      expect(documentService.generateExecutionLogDoc).toHaveBeenCalledWith([
        `[User: ${mockUserId} | Role: ADMIN] [START] HTTP GET /api`,
      ]);

      // 4. Ensure it was appended to daily master log
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining("daily-execution.log"),
        rawLogText
      );
    });

    it("should skip document generation if user has logging disabled", async () => {
      const mockUserId = "disabled-user-id";
      const rawLogText = `[User: ${mockUserId} | Role: ADMIN] [START] HTTP GET /api`;

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(rawLogText);

      // Database returns empty array, meaning the user opted out
      userService.findUsersWithLoggingEnabled.mockResolvedValue([]);

      await service.processUserLogs();

      // Ensure doc was NOT generated
      expect(documentService.generateExecutionLogDoc).not.toHaveBeenCalled();

      // Ensure logs were still moved to daily file
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining("daily-execution.log"),
        rawLogText
      );
    });
  });
});
