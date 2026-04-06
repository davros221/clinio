import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { ThrottlerModule } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { MailService } from "./mail.service";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: "activation-email",
        ttl: 60_000,
        limit: 3,
      },
    ]),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>("mail.host");

        const transport = host
          ? {
              host,
              port: configService.get("mail.port"),
              secure: configService.get("mail.secure"),
              auth: {
                user: configService.get("mail.user"),
                pass: configService.get("mail.password"),
              },
            }
          : { jsonTransport: true };

        return {
          transport,
          defaults: {
            from: configService.get("mail.from"),
          },
          template: {
            dir: join(__dirname, "templates"),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
