import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { UserRole } from "@clinio/shared";
import { AuthResponse, MeResponse } from "../dto/auth-response.dto";

const mockAuthService = () => ({
  login: jest.fn(),
  me: jest.fn(),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
});

describe("AuthController", () => {
  let controller: AuthController;
  let service: jest.Mocked<
    Pick<AuthService, "login" | "me" | "requestPasswordReset" | "resetPassword">
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot()],
      controllers: [AuthController],
      providers: [{ provide: AuthService, useFactory: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe("login", () => {
    const loginDto = { email: "john@example.com", password: "StrongP@ss1" };
    const authResponse: AuthResponse = {
      accessToken: "jwt-token",
      authData: {
        firstName: "John",
        lastName: "Doe",
        role: UserRole.DOCTOR,
      },
    };

    it("should call authService.login and return result", async () => {
      service.login.mockResolvedValue(authResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(authResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe("requestPasswordReset", () => {
    const dto = { email: "user@example.com" };

    it("should call authService.requestPasswordReset and return success", async () => {
      service.requestPasswordReset.mockResolvedValue(true);

      const result = await controller.requestPasswordReset(dto);

      expect(result).toEqual({ success: true });
      expect(service.requestPasswordReset).toHaveBeenCalledWith(dto.email);
    });
  });

  describe("resetPassword", () => {
    const dto = { token: "reset-token", password: "NewPassword123" };

    it("should call authService.resetPassword and return result", async () => {
      const resetResult = { email: "user@example.com" };
      service.resetPassword.mockResolvedValue(resetResult);

      const result = await controller.resetPassword(dto);

      expect(result).toEqual(resetResult);
      expect(service.resetPassword).toHaveBeenCalledWith(
        dto.token,
        dto.password
      );
    });
  });

  describe("me", () => {
    const currentUser = { id: "user-id" };
    const meResponse: MeResponse = {
      auth: true,
      authData: {
        firstName: "John",
        lastName: "Doe",
        role: UserRole.DOCTOR,
      },
    };

    it("should call authService.me with user id and return result", async () => {
      service.me.mockResolvedValue(meResponse);

      const result = await controller.me(currentUser);

      expect(result).toEqual(meResponse);
      expect(service.me).toHaveBeenCalledWith(currentUser.id);
    });
  });
});
