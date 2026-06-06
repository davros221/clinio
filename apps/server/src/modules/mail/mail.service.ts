import { Injectable, OnModuleInit } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import mjml2html from "mjml";
import Handlebars from "handlebars";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly templates = new Map<string, Handlebars.TemplateDelegate>();

  constructor(private readonly mailerService: MailerService) {}

  onModuleInit(): void {
    const dir = join(__dirname, "templates");
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".mjml"))) {
      const source = readFileSync(join(dir, file), "utf-8");
      const { html, errors } = mjml2html(source, { validationLevel: "soft" });
      if (errors?.length) {
        console.warn(`MJML warnings in ${file}:`, errors);
      }
      this.templates.set(file.replace(".mjml", ""), Handlebars.compile(html));
    }
  }

  async sendWelcomeEmail(
    to: string,
    firstName: string,
    activateUrl: string,
    expiresAt: string,
    invitedBy?: string
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: "Welcome to ClinIO – activate your account",
      template: "welcome-client",
      context: { firstName, activateUrl, expiresAt, invitedBy },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    from?: string;
    context?: Record<string, unknown>;
  }): Promise<void> {
    const render = this.templates.get(options.template);
    if (!render) {
      throw new Error(`Mail template "${options.template}" not found`);
    }
    await this.mailerService.sendMail({
      to: options.to,
      from: options.from,
      subject: options.subject,
      html: render(options.context ?? {}),
    });
  }
}
