import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { invalidCredentials } from "../common/error-messages";
import { UserService } from "../modules/user/user.service";
import { LoginDto } from "./dto/login.dto";
import { AuthResponse, MeResponse } from "./dto/auth-response.dto";
import { JwtPayload } from "./strategies/jwt.strategy";
import { UserMapper } from "../modules/user/mapper/UserMapper";

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password || !(await bcrypt.compare(dto.password, user.password))) {
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

  async me(userId: string): Promise<MeResponse> {
    const user = await this.userService.findById(userId);
    const authData = UserMapper.toAuthData(user);

    return {
      auth: true,
      authData,
    };
  }
}
