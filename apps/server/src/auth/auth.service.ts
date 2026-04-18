import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  accountNotActive,
  resetTokenExpired,
  invalidResetToken,
  invalidCredentials,
  notFound,
  googleEmailNotVerified,
} from "../common/error-messages";
import { UserService } from "../modules/user/user.service";
import { UserEntity } from "../modules/user/user.entity";
import { MailService } from "../modules/mail/mail.service";
import { LoginDto } from "./dto/login.dto";
import { AuthResponse, MeResponse } from "./dto/auth-response.dto";
import { JwtPayload } from "./strategies/jwt.strategy";
import { GoogleProfile } from "./strategies/google.strategy";
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

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw notFound("User");
    }

    const token = this.createResetToken();
    const expiresAt = addHours(new Date(), 2);

    user.resetToken = token;
    user.resetTokenExpiresAt = expiresAt;

    await this.userService.update(user);

    const clientUrl = this.configService.getOrThrow<string>("client.url");
    const resetUrl = `${clientUrl}/activate?token=${token}`;

    await this.mailService.sendMail({
      to: user.email,
      from: this.configService.getOrThrow<string>("mail.from"),
      subject: "Password reset - ClinIO",
      template: "reset-password",
      context: {
        resetUrl,
        expiresAt: format(expiresAt, "d. M. yyyy HH:mm"),
      },
    });

    return true;
  }

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ email: string }> {
    const user = await this.userService.findByResetToken(token);

    if (!user) {
      throw invalidResetToken();
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw resetTokenExpired();
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;

    await this.userService.update(user);

    return { email: user.email };
  }

  async validateGoogleUser(profile: GoogleProfile): Promise<UserEntity> {
    if (!profile.emailVerified) {
      throw googleEmailNotVerified();
    }

    const byGoogleId = await this.userService.findByGoogleId(profile.googleId);
    if (byGoogleId) {
      return byGoogleId;
    }

    const byEmail = await this.userService.findByEmail(profile.email);
    if (byEmail) {
      byEmail.googleId = profile.googleId;
      return this.userService.update(byEmail);
    }

    return this.userService.createGoogleUser({
      googleId: profile.googleId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  }

  googleLogin(user: UserEntity): { accessToken: string } {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async me(userId: string): Promise<MeResponse> {
    const user = await this.userService.findById(userId);
    const authData = UserMapper.toAuthData(user);

    return {
      auth: true,
      authData,
    };
  }

  private createResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
