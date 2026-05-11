import { Test, TestingModule } from "@nestjs/testing";
import { LogSchedulerService } from "../log-scheduler.service";
import { DocumentService } from "../document.service";
import * as fs from "fs";
import * as path from "path";

jest.mock("fs");

describe("LogSchedulerService", () => {
  let service: LogSchedulerService;
  let documentService: jest.Mocked<DocumentService>;

  beforeEach(async () => {
    const mockDocumentService = {
      generateExecutionLogDoc: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogSchedulerService,
        { provide: DocumentService, useValue: mockDocumentService },
      ],
    }).compile();

    service = module.get<LogSchedulerService>(LogSchedulerService);
    documentService = module.get(
      DocumentService
    ) as jest.Mocked<DocumentService>;
    jest.clearAllMocks();
  });

  describe("handleNightlyLogArchiving", () => {
    it("should abort if log file does not exist", async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await service.handleNightlyLogArchiving();

      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(documentService.generateExecutionLogDoc).not.toHaveBeenCalled();
    });

    it("should abort if log file is empty", async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue("\n  \n"); // Only empty lines

      await service.handleNightlyLogArchiving();

      expect(documentService.generateExecutionLogDoc).not.toHaveBeenCalled();
    });

    it("should archive logs and clear the original file", async () => {
      const mockLogs = "Log 1\nLog 2";
      const mockBuffer = Buffer.from("mock-doc");

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockLogs);
      documentService.generateExecutionLogDoc.mockResolvedValue(mockBuffer);

      await service.handleNightlyLogArchiving();

      // Check if document was generated with filtered logs
      expect(documentService.generateExecutionLogDoc).toHaveBeenCalledWith([
        "Log 1",
        "Log 2",
      ]);

      // Check if the file was saved
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(".docx"),
        mockBuffer
      );

      // Check if the original log was truncated
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("daily-execution.log"),
        ""
      );
    });
  });
});
