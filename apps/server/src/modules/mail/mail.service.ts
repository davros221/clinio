import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    from?: string;
    context?: Record<string, unknown>;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to: options.to,
      from: options.from,
      subject: options.subject,
      template: options.template,
      context: options.context,
    });
  }
}
