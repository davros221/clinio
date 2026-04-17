import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AuthService } from "../auth.service";
import { UserService } from "../../modules/user/user.service";
import { MailService } from "../../modules/mail/mail.service";
import { UserEntity } from "../../modules/user/user.entity";
import { UserRole, ErrorCode } from "@clinio/shared";
import { addHours } from "date-fns";

const mockUser: UserEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "john@example.com",
  password: "hashed-password",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.DOCTOR,
};

const mockUserService = () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByResetToken: jest.fn(),
  update: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockMailService = () => ({
  sendMail: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn(),
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, string> = {
      "client.url": "http://localhost:3000",
      "mail.from": "ClinIO <noreply@example.com>",
    };
    return config[key];
  }),
});

describe("AuthService", () => {
  let service: AuthService;
  let userService: jest.Mocked<
    Pick<
      UserService,
      "findByEmail" | "findById" | "findByResetToken" | "update"
    >
  >;
  let jwtService: jest.Mocked<Pick<JwtService, "sign">>;
  let mailService: jest.Mocked<Pick<MailService, "sendMail">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useFactory: mockUserService },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: MailService, useFactory: mockMailService },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
  });

  describe("login", () => {
    const loginDto = { email: "john@example.com", password: "StrongP@ss1" };

    it("should return access token and auth data on valid credentials", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true));
      jwtService.sign.mockReturnValue("jwt-token");

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: "jwt-token",
        authData: {
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
      });
    });

    it("should sign JWT with correct payload", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true));
      jwtService.sign.mockReturnValue("jwt-token");

      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it("should throw UnauthorizedException when user not found", async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw with INVALID_CREDENTIALS error code when user not found", async () => {
      userService.findByEmail.mockResolvedValue(null);

      try {
        await service.login(loginDto);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).getResponse()).toMatchObject({
          errorCode: ErrorCode.INVALID_CREDENTIALS,
        });
      }
    });

    it("should throw UnauthorizedException when password is wrong", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw with INVALID_CREDENTIALS error code when password is wrong", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false));

      try {
        await service.login(loginDto);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).getResponse()).toMatchObject({
          errorCode: ErrorCode.INVALID_CREDENTIALS,
        });
      }
    });

    it("should throw when user has no password (account not active)", async () => {
      const passwordlessUser: UserEntity = { ...mockUser, password: null };
      userService.findByEmail.mockResolvedValue(passwordlessUser);

      try {
        await service.login(loginDto);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).getResponse()).toMatchObject({
          errorCode: ErrorCode.ACCOUNT_NOT_ACTIVE,
        });
      }
    });

    it("should not leak whether email or password was wrong", async () => {
      userService.findByEmail.mockResolvedValue(null);
      let errorNoUser: UnauthorizedException | undefined;
      try {
        await service.login(loginDto);
      } catch (e) {
        errorNoUser = e as UnauthorizedException;
      }

      userService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false));
      let errorBadPass: UnauthorizedException | undefined;
      try {
        await service.login(loginDto);
      } catch (e) {
        errorBadPass = e as UnauthorizedException;
      }

      expect(errorNoUser!.getResponse()).toEqual(errorBadPass!.getResponse());
    });
  });

  describe("requestPasswordReset", () => {
    const user: UserEntity = {
      ...mockUser,
    };

    it("should send reset email", async () => {
      userService.findByEmail.mockResolvedValue(user);
      userService.update.mockResolvedValue(user);
      mailService.sendMail.mockResolvedValue(undefined);

      const result = await service.requestPasswordReset(user.email);

      expect(result).toBe(true);
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: user.email,
          subject: "Password reset - ClinIO",
          template: "reset-password",
        })
      );
    });

    it("should set reset token and expiry on user", async () => {
      userService.findByEmail.mockResolvedValue(user);
      userService.update.mockResolvedValue(user);
      mailService.sendMail.mockResolvedValue(undefined);

      await service.requestPasswordReset(user.email);

      expect(userService.update).toHaveBeenCalledWith(
        expect.objectContaining({
          resetToken: expect.any(String),
          resetTokenExpiresAt: expect.any(Date),
        })
      );
    });

    it("should build reset URL from client.url config", async () => {
      userService.findByEmail.mockResolvedValue(user);
      userService.update.mockResolvedValue(user);
      mailService.sendMail.mockResolvedValue(undefined);

      await service.requestPasswordReset(user.email);

      const callArgs = mailService.sendMail.mock.calls[0][0];
      expect(callArgs.context?.resetUrl).toMatch(
        /^http:\/\/localhost:3000\/activate\?token=.+/
      );
    });

    it("should throw NotFoundException when user not found", async () => {
      userService.findByEmail.mockResolvedValue(null);

      try {
        await service.requestPasswordReset("unknown@example.com");
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe("resetPassword", () => {
    const token = "valid-reset-token";
    const password = "NewPassword123";
    const userWithToken: UserEntity = {
      ...mockUser,
      password: undefined,
      resetToken: token,
      resetTokenExpiresAt: addHours(new Date(), 1),
    };

    it("should hash password and clear reset token", async () => {
      userService.findByResetToken.mockResolvedValue({
        ...userWithToken,
      });
      userService.update.mockImplementation(async (user) => user);
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed-new-password"));

      await service.resetPassword(token, password);

      expect(userService.update).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "hashed-new-password",
          resetToken: undefined,
          resetTokenExpiresAt: undefined,
        })
      );
    });

    it("should return email on success", async () => {
      userService.findByResetToken.mockResolvedValue({
        ...userWithToken,
      });
      userService.update.mockImplementation(async (user) => user);
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed-new-password"));

      const result = await service.resetPassword(token, password);

      expect(result).toEqual({ email: userWithToken.email });
    });

    it("should throw INVALID_RESET_TOKEN when token not found", async () => {
      userService.findByResetToken.mockResolvedValue(null);

      try {
        await service.resetPassword("bad-token", password);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toMatchObject({
          errorCode: ErrorCode.INVALID_RESET_TOKEN,
        });
      }
    });

    it("should throw RESET_TOKEN_EXPIRED when token has expired", async () => {
      const expiredUser: UserEntity = {
        ...userWithToken,
        resetTokenExpiresAt: new Date(Date.now() - 1000),
      };
      userService.findByResetToken.mockResolvedValue(expiredUser);

      try {
        await service.resetPassword(token, password);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toMatchObject({
          errorCode: ErrorCode.RESET_TOKEN_EXPIRED,
        });
      }
    });

    it("should throw RESET_TOKEN_EXPIRED when expiresAt is missing", async () => {
      const noExpiryUser: UserEntity = {
        ...userWithToken,
        resetTokenExpiresAt: undefined,
      };
      userService.findByResetToken.mockResolvedValue(noExpiryUser);

      try {
        await service.resetPassword(token, password);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toMatchObject({
          errorCode: ErrorCode.RESET_TOKEN_EXPIRED,
        });
      }
    });
  });

  describe("me", () => {
    it("should return auth data for valid user", async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await service.me(mockUser.id);

      expect(result).toEqual({
        auth: true,
        authData: {
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
      });
    });

    it("should call userService.findById with correct id", async () => {
      userService.findById.mockResolvedValue(mockUser);

      await service.me(mockUser.id);

      expect(userService.findById).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
