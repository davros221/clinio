import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  accountAlreadyActivated,
  accountNotActive,
  activationTokenExpired,
  invalidActivationToken,
  invalidCredentials,
  notFound,
} from "../common/error-messages";
import { UserService } from "../modules/user/user.service";
import { MailService } from "../modules/mail/mail.service";
import { LoginDto } from "./dto/login.dto";
import { AuthResponse, MeResponse } from "./dto/auth-response.dto";
import { JwtPayload } from "./strategies/jwt.strategy";
import { UserMapper } from "../modules/user/mapper/UserMapper";
import { addHours, format } from "date-fns";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw invalidCredentials();
    }

    if (!user?.password) {
      throw accountNotActive();
    }

    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw invalidCredentials();
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const authData = UserMapper.toAuthData(user);

    return {
      accessToken,
      authData,
    };
  }

  async sendActivationEmail(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw notFound("User");
    }

    if (user.password) {
      throw accountAlreadyActivated();
    }

    const token = this.createActivationToken();
    const expiresAt = addHours(new Date(), 2);

    user.activationToken = token;
    user.activationTokenExpiresAt = expiresAt;

    await this.userService.update(user);

    const clientUrl = this.configService.getOrThrow<string>("client.url");
    const activationUrl = `${clientUrl}/activate?token=${token}`;

    await this.mailService.sendMail({
      to: user.email,
      from: this.configService.getOrThrow<string>("mail.from"),
      subject: "Account activation - ClinIO",
      template: "activation",
      context: {
        activationUrl,
        expiresAt: format(expiresAt, "d. M. yyyy HH:mm"),
      },
    });

    return true;
  }

  async activateAccount(token: string, password: string): Promise<void> {
    const user = await this.userService.findByActivationToken(token);

    if (!user) {
      throw invalidActivationToken();
    }

    if (user.password) {
      throw accountAlreadyActivated();
    }

    if (
      !user.activationTokenExpiresAt ||
      user.activationTokenExpiresAt < new Date()
    ) {
      throw activationTokenExpired();
    }

    user.password = await bcrypt.hash(password, 10);
    user.activationToken = undefined;
    user.activationTokenExpiresAt = undefined;

    await this.userService.update(user);
  }

  async me(userId: string): Promise<MeResponse> {
    const user = await this.userService.findById(userId);
    const authData = UserMapper.toAuthData(user);

    return {
      auth: true,
      authData,
    };
  }

  private createActivationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
