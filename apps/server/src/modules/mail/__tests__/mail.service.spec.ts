import { Test, TestingModule } from "@nestjs/testing";
import { MailerService } from "@nestjs-modules/mailer";
import { MailService } from "../mail.service";

const mockMailerService = () => ({
  sendMail: jest.fn(),
});

describe("MailService", () => {
  let service: MailService;
  let mailerService: jest.Mocked<Pick<MailerService, "sendMail">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useFactory: mockMailerService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get(MailerService);
  });

  describe("sendMail", () => {
    it("should call mailerService.sendMail with correct options", async () => {
      mailerService.sendMail.mockResolvedValue(undefined);

      await service.sendMail({
        to: "user@example.com",
        subject: "Test Subject",
        template: "activation",
        context: { activationUrl: "https://example.com/activate" },
      });

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: "user@example.com",
        from: undefined,
        subject: "Test Subject",
        template: "activation",
        context: { activationUrl: "https://example.com/activate" },
      });
    });

    it("should pass custom from when provided", async () => {
      mailerService.sendMail.mockResolvedValue(undefined);

      await service.sendMail({
        to: "user@example.com",
        from: "Custom <custom@example.com>",
        subject: "Test",
        template: "test",
      });

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: "Custom <custom@example.com>" })
      );
    });

    it("should propagate errors from mailerService", async () => {
      mailerService.sendMail.mockRejectedValue(new Error("SMTP error"));

      await expect(
        service.sendMail({
          to: "user@example.com",
          subject: "Test",
          template: "test",
        })
      ).rejects.toThrow("SMTP error");
    });
  });
});
