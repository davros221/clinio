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
  findByActivationToken: jest.fn(),
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
      "findByEmail" | "findById" | "findByActivationToken" | "update"
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

  describe("sendActivationEmail", () => {
    const inactiveUser: UserEntity = {
      ...mockUser,
      password: undefined,
    };

    it("should send activation email for inactive user", async () => {
      userService.findByEmail.mockResolvedValue(inactiveUser);
      userService.update.mockResolvedValue(inactiveUser);
      mailService.sendMail.mockResolvedValue(undefined);

      const result = await service.sendActivationEmail(inactiveUser.email);

      expect(result).toBe(true);
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: inactiveUser.email,
          subject: "Account activation - ClinIO",
          template: "activation",
        })
      );
    });

    it("should set activation token and expiry on user", async () => {
      userService.findByEmail.mockResolvedValue(inactiveUser);
      userService.update.mockResolvedValue(inactiveUser);
      mailService.sendMail.mockResolvedValue(undefined);

      await service.sendActivationEmail(inactiveUser.email);

      expect(userService.update).toHaveBeenCalledWith(
        expect.objectContaining({
          activationToken: expect.any(String),
          activationTokenExpiresAt: expect.any(Date),
        })
      );
    });

    it("should build activation URL from client.url config", async () => {
      userService.findByEmail.mockResolvedValue(inactiveUser);
      userService.update.mockResolvedValue(inactiveUser);
      mailService.sendMail.mockResolvedValue(undefined);

      await service.sendActivationEmail(inactiveUser.email);

      const callArgs = mailService.sendMail.mock.calls[0][0];
      expect(callArgs.context?.activationUrl).toMatch(
        /^http:\/\/localhost:3000\/activate\?token=.+/
      );
    });

    it("should throw NotFoundException when user not found", async () => {
      userService.findByEmail.mockResolvedValue(null);

      try {
        await service.sendActivationEmail("unknown@example.com");
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it("should throw ACCOUNT_ALREADY_ACTIVATED when user has password", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);

      try {
        await service.sendActivationEmail(mockUser.email);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).getResponse()).toMatchObject({
          errorCode: ErrorCode.ACCOUNT_ALREADY_ACTIVATED,
        });
      }
    });
  });

  describe("activateAccount", () => {
    const token = "valid-activation-token";
    const password = "NewPassword123";
    const inactiveUser: UserEntity = {
      ...mockUser,
      password: undefined,
      activationToken: token,
      activationTokenExpiresAt: addHours(new Date(), 1),
    };

    it("should hash password and clear activation token", async () => {
      userService.findByActivationToken.mockResolvedValue({
        ...inactiveUser,
      });
      userService.update.mockImplementation(async (user) => user);
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed-new-password"));

      await service.activateAccount(token, password);

      expect(userService.update).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "hashed-new-password",
          activationToken: undefined,
          activationTokenExpiresAt: undefined,
        })
      );
    });

    it("should throw INVALID_ACTIVATION_TOKEN when token not found", async () => {
      userService.findByActivationToken.mockResolvedValue(null);

      try {
        await service.activateAccount("bad-token", password);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toMatchObject({
          errorCode: ErrorCode.INVALID_ACTIVATION_TOKEN,
        });
      }
    });

    it("should throw ACCOUNT_ALREADY_ACTIVATED when user already has password", async () => {
      userService.findByActivationToken.mockResolvedValue({
        ...mockUser,
        activationToken: token,
        activationTokenExpiresAt: addHours(new Date(), 1),
      });

      try {
        await service.activateAccount(token, password);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).getResponse()).toMatchObject({
          errorCode: ErrorCode.ACCOUNT_ALREADY_ACTIVATED,
        });
      }
    });

    it("should throw ACTIVATION_TOKEN_EXPIRED when token has expired", async () => {
      const expiredUser: UserEntity = {
        ...inactiveUser,
        activationTokenExpiresAt: new Date(Date.now() - 1000),
      };
      userService.findByActivationToken.mockResolvedValue(expiredUser);

      try {
        await service.activateAccount(token, password);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toMatchObject({
          errorCode: ErrorCode.ACTIVATION_TOKEN_EXPIRED,
        });
      }
    });

    it("should throw ACTIVATION_TOKEN_EXPIRED when expiresAt is missing", async () => {
      const noExpiryUser: UserEntity = {
        ...inactiveUser,
        activationTokenExpiresAt: undefined,
      };
      userService.findByActivationToken.mockResolvedValue(noExpiryUser);

      try {
        await service.activateAccount(token, password);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toMatchObject({
          errorCode: ErrorCode.ACTIVATION_TOKEN_EXPIRED,
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
