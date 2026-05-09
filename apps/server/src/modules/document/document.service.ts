import { Injectable, Logger } from "@nestjs/common";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  async generateExecutionLogDoc(logs: string[]): Promise<Buffer> {
    this.logger.log("Generating Word document for execution logs...");

    // 1. Build the document structure
    const doc = new Document({
      creator: "Clinio System",
      title: "Backend Execution Logs",
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: "System Execution Report",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            // Meta info
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated on: ${new Date().toLocaleString()}`,
                  italics: true,
                  color: "888888",
                }),
              ],
              spacing: { after: 400 },
            }),
            // The actual logs mapped to paragraphs
            ...logs.map(
              (log) =>
                new Paragraph({
                  children: [new TextRun({ text: log, font: "Courier New" })],
                  spacing: { after: 100 },
                })
            ),
          ],
        },
      ],
    });

    // 2. Pack the document into a Buffer so it can be saved or sent over HTTP
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  // Optional helper if you want to save it straight to the disk locally
  async saveDocumentLocally(buffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(process.cwd(), "logs", filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }
}
