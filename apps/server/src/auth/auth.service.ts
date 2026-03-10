import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { invalidCredentials } from "../common/error-messages";
import { UserService } from "../modules/user/user.service";
import { LoginDto } from "./dto/login.dto";
import { AuthResponse, MeResponse } from "./dto/auth-response.dto";
import { JwtPayload } from "./strategies/jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw invalidCredentials();
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      authData: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async me(userId: string | undefined): Promise<MeResponse> {
    if (!userId) {
      return { auth: false, authData: null };
    }

    try {
      const user = await this.userService.findById(userId);
      return {
        auth: true,
        authData: {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch {
      return { auth: false, authData: null };
    }
  }
}
