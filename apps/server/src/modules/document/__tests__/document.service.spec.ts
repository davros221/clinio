import { Test, TestingModule } from "@nestjs/testing";
import { DocumentService } from "../document.service";
import { Packer } from "docx";
import * as fs from "fs";
import * as path from "path";

// Mock the external docx library and fs
jest.mock("docx", () => {
  const actualDocx = jest.requireActual("docx");
  return {
    ...actualDocx,
    Packer: {
      toBuffer: jest.fn(),
    },
  };
});
jest.mock("fs");

describe("DocumentService", () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentService],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    jest.clearAllMocks();
  });

  describe("generateExecutionLogDoc", () => {
    it("should create a document and return a buffer", async () => {
      const mockLogs = ["[START] HTTP GET /api", "[END] Completed in 20ms"];
      const mockBuffer = Buffer.from("mock-doc-buffer");

      (Packer.toBuffer as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.generateExecutionLogDoc(mockLogs);

      expect(Packer.toBuffer).toHaveBeenCalled();
      expect(result).toEqual(mockBuffer);
    });
  });

  describe("saveDocumentLocally", () => {
    it("should save the buffer to the correct file path", async () => {
      const mockBuffer = Buffer.from("test");
      const filename = "test.docx";
      const expectedPath = path.join(process.cwd(), "logs", filename);

      const result = await service.saveDocumentLocally(mockBuffer, filename);

      expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, mockBuffer);
      expect(result).toEqual(expectedPath);
    });
  });
});
