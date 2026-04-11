import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { UserRole } from "@clinio/shared";
import { AuthResponse, MeResponse } from "../dto/auth-response.dto";

const mockAuthService = () => ({
  login: jest.fn(),
  me: jest.fn(),
  sendActivationEmail: jest.fn(),
  activateAccount: jest.fn(),
});

describe("AuthController", () => {
  let controller: AuthController;
  let service: jest.Mocked<
    Pick<
      AuthService,
      "login" | "me" | "sendActivationEmail" | "activateAccount"
    >
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

  describe("sendActivationEmail", () => {
    const dto = { email: "user@example.com" };

    it("should call authService.sendActivationEmail and return success", async () => {
      service.sendActivationEmail.mockResolvedValue(true);

      const result = await controller.sendActivationEmail(dto);

      expect(result).toEqual({ success: true });
      expect(service.sendActivationEmail).toHaveBeenCalledWith(dto.email);
    });
  });

  describe("activateAccount", () => {
    const dto = { token: "activation-token", password: "NewPassword123" };

    it("should call authService.activateAccount and return success", async () => {
      service.activateAccount.mockResolvedValue(undefined);

      const result = await controller.activateAccount(dto);

      expect(result).toEqual({ success: true });
      expect(service.activateAccount).toHaveBeenCalledWith(
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
